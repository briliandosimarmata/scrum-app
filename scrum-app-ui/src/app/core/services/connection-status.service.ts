import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, BehaviorSubject, of } from 'rxjs';
import { catchError, map, switchMap, startWith, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, HealthResponse } from '../../shared/interfaces';

export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CHECKING = 'checking'
}

@Injectable({
  providedIn: 'root'
})
export class ConnectionStatusService {
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
  private readonly HEALTH_CHECK_URL = `${environment.apiUrl}/public/v1/health`;

  // Signals for reactive state management
  private _status = signal<ConnectionStatus>(ConnectionStatus.CHECKING);
  private _lastChecked = signal<Date | null>(null);
  private _errorMessage = signal<string | null>(null);

  // Computed signals
  public status = computed(() => this._status());
  public lastChecked = computed(() => this._lastChecked());
  public errorMessage = computed(() => this._errorMessage());
  public isConnected = computed(() => this._status() === ConnectionStatus.CONNECTED);
  public isDisconnected = computed(() => this._status() === ConnectionStatus.DISCONNECTED);
  public isChecking = computed(() => this._status() === ConnectionStatus.CHECKING);

  // BehaviorSubject for components that need observables
  private statusSubject = new BehaviorSubject<ConnectionStatus>(ConnectionStatus.CHECKING);
  public status$ = this.statusSubject.asObservable();

  private http = inject(HttpClient);

  constructor() {
    // Start periodic health checks
    this.startHealthChecks();
  }

  /**
   * Check connection status immediately
   */
  checkConnection(): Observable<boolean> {
    this._status.set(ConnectionStatus.CHECKING);
    this.statusSubject.next(ConnectionStatus.CHECKING);

    return this.http.get<ApiResponse<HealthResponse>>(this.HEALTH_CHECK_URL).pipe(
      map(response => {
        if (response.success && response.data) {
          this._status.set(ConnectionStatus.CONNECTED);
          this._errorMessage.set(null);
          this.statusSubject.next(ConnectionStatus.CONNECTED);
          return true;
        } else {
          this._status.set(ConnectionStatus.DISCONNECTED);
          this._errorMessage.set(response.message || 'Health check failed');
          this.statusSubject.next(ConnectionStatus.DISCONNECTED);
          return false;
        }
      }),
      catchError(error => {
        this._status.set(ConnectionStatus.DISCONNECTED);
        this._errorMessage.set(this.getErrorMessage(error));
        this.statusSubject.next(ConnectionStatus.DISCONNECTED);
        return of(false);
      }),
      tap(() => {
        this._lastChecked.set(new Date());
      })
    );
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    interval(this.HEALTH_CHECK_INTERVAL).pipe(
      startWith(0), // Check immediately on start
      switchMap(() => this.checkConnection())
    ).subscribe();
  }

  /**
   * Get status badge class for UI
   */
  getStatusBadgeClass(): string {
    switch (this._status()) {
      case ConnectionStatus.CONNECTED:
        return 'bg-green-100 text-green-700';
      case ConnectionStatus.DISCONNECTED:
        return 'bg-red-100 text-red-700';
      case ConnectionStatus.CHECKING:
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  /**
   * Get status icon for UI
   */
  getStatusIcon(): string {
    switch (this._status()) {
      case ConnectionStatus.CONNECTED:
        return '✓';
      case ConnectionStatus.DISCONNECTED:
        return '✗';
      case ConnectionStatus.CHECKING:
        return '⟳';
      default:
        return '?';
    }
  }

  /**
   * Get status text for UI
   */
  getStatusText(): string {
    switch (this._status()) {
      case ConnectionStatus.CONNECTED:
        return 'Connected';
      case ConnectionStatus.DISCONNECTED:
        return 'Disconnected';
      case ConnectionStatus.CHECKING:
        return 'Checking...';
      default:
        return 'Unknown';
    }
  }

  /**
   * Extract error message from HTTP error
   */
  private getErrorMessage(error: any): string {
    if (error.error?.error?.message) {
      return error.error.error.message;
    } else if (error.error?.message) {
      return error.error.message;
    } else if (error.message) {
      return error.message;
    } else if (error.status === 0) {
      return 'Network error - Backend server is not reachable';
    } else {
      return `Connection failed (${error.status})`;
    }
  }
}
