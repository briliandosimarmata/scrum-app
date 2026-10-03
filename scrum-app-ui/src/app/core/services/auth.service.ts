import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, RegisterRequest, AuthResponse, ApiResponse, AssigneeRegistrationRequest, AssigneeRegistrationResponse } from '../../shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'scrum_app_auth_token';
  private readonly REFRESH_TOKEN_KEY = 'scrum_app_refresh_token';
  private readonly USER_KEY = 'scrum_app_current_user';
  private readonly SELECTED_ROLE_KEY_PREFIX = 'scrum_app_selected_role_';

  // Signals for reactive state management
  private _currentUser = signal<User | null>(this.getStoredUser());
  private _isAuthenticated = signal<boolean>(this.checkAuthStatus());
  private _token = signal<string | null>(this.getStoredToken());

  // Computed signals
  public currentUser = computed(() => this._currentUser());
  public isAuthenticated = computed(() => this._isAuthenticated());
  public token = computed(() => this._token());

  // BehaviorSubject for components that need observables
  private authStateSubject = new BehaviorSubject<boolean>(this._isAuthenticated());
  public authState$ = this.authStateSubject.asObservable();

  private http = inject(HttpClient);
  private router = inject(Router);

  // Login method
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/public/v1/auth/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setAuthData(response.data.token, response.data.user, response.data.refreshToken);
          this.authStateSubject.next(true);
        }
      }),
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Login failed');
        }
        return response.data;
      }),
      catchError(error => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  // Register method
  register(userData: RegisterRequest): Observable<User> {
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/public/v1/auth/register`, userData).pipe(
      tap(response => {
        if (response.success && response.data) {
          // After successful registration, automatically log in
          this.setAuthData(response.data.token, response.data.user, response.data.refreshToken);
          this.authStateSubject.next(true);
        }
      }),
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Registration failed');
        }
        return response.data.user;
      }),
      catchError(error => {
        console.error('Registration error:', error);
        throw error;
      })
    );
  }

  // Register Assignee method
  registerAssignee(payload: AssigneeRegistrationRequest): Observable<ApiResponse<AssigneeRegistrationResponse>> {
    const body: AssigneeRegistrationRequest = {
      email: payload.email,
      password: payload.password,
      assigneeCode: payload.assigneeCode?.toUpperCase?.() ?? payload.assigneeCode,
      projectKey: payload.projectKey,
    };
    return this.http.post<ApiResponse<AssigneeRegistrationResponse>>(
      `${environment.apiUrl}/public/v1/assignee-registration`,
      body
    );
  }

  // Logout method
  logout(): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${environment.apiUrl}/public/v1/auth/logout`, {}).pipe(
      tap(() => {
        this.clearAuthData();
        this.authStateSubject.next(false);
        this.router.navigate(['/auth/login']);
      }),
      map(() => void 0),
      catchError(error => {
        console.error('Logout error:', error);
        // Still clear local data even if API call fails
        this.clearAuthData();
        this.authStateSubject.next(false);
        this.router.navigate(['/auth/login']);
        throw error;
      })
    );
  }

  // Check if user is authenticated
  isLoggedIn(): boolean {
    return this._isAuthenticated();
  }

  // Get current user
  getCurrentUser(): User | null {
    return this._currentUser();
  }

  // Get auth token
  getToken(): string | null {
    return this._token();
  }

  // Refresh token method
  refreshToken(): Observable<string> {
    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      return of('');
    }

    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/public/v1/auth/refresh`, {}, {
      headers: { 'Authorization': `Bearer ${refreshToken}` }
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setAuthData(response.data.token, response.data.user, response.data.refreshToken);
          this.authStateSubject.next(true);
        }
      }),
      map(response => response.data?.token || ''),
      catchError(error => {
        console.error('Token refresh error:', error);
        // Clear auth data if refresh fails
        this.clearAuthData();
        this.authStateSubject.next(false);
        return of('');
      })
    );
  }

  // Private helper methods
  private setAuthData(token: string, user: User, refreshToken?: string): void {
    this._token.set(token);
    this._currentUser.set(user);
    this._isAuthenticated.set(true);
    
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  private clearAuthData(): void {
    const user = this._currentUser();
    if (user) {
      // Clear selected role for this user
      this.clearSelectedRole(user.id);
    }
    
    this._token.set(null);
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  private getStoredToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private getStoredRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  private checkAuthStatus(): boolean {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    
    if (!token || !user) {
      return false;
    }

    // In a real app, you would validate the token here
    // For now, we'll just check if it exists
    return true;
  }

  // Initialize auth state on app start
  initializeAuth(): void {
    if (this.checkAuthStatus()) {
      this._isAuthenticated.set(true);
      this.authStateSubject.next(true);
    } else {
      this._isAuthenticated.set(false);
      this.authStateSubject.next(false);
    }
  }

  // Selected role management methods
  getSelectedRoleKey(userId: string): string {
    return `${this.SELECTED_ROLE_KEY_PREFIX}${userId}`;
  }

  getSelectedRole(userId: string): string | null {
    try {
      const role = localStorage.getItem(this.getSelectedRoleKey(userId));
      return role;
    } catch {
      return null;
    }
  }

  setSelectedRole(userId: string, role: 'project_manager' | 'assignee'): void {
    try {
      localStorage.setItem(this.getSelectedRoleKey(userId), role);
    } catch (error) {
      console.error('Error saving selected role:', error);
    }
  }

  clearSelectedRole(userId: string): void {
    try {
      localStorage.removeItem(this.getSelectedRoleKey(userId));
    } catch (error) {
      console.error('Error clearing selected role:', error);
    }
  }
}

