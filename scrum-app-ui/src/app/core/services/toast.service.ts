import { Injectable, signal, computed } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface ToastMessage {
  id: string;
  type: 'error' | 'success' | 'custom';
  title: string;
  description: string;
  timeout?: number;
  isClosing?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<ToastMessage[]>([]);
  private toastIdCounter = 0;

  // Public readonly signal for components to subscribe to
  readonly toasts$ = computed(() => this.toasts());

  /**
   * Show error toast message
   */
  showError(description: string, title: string = 'Error', timeout: number = environment.toastTimeout): void {
    this.addToast({
      type: 'error',
      title,
      description,
      timeout
    });
  }

  /**
   * Show success toast message
   */
  showSuccess(description: string, title: string = 'Success', timeout: number = environment.toastTimeout): void {
    this.addToast({
      type: 'success',
      title,
      description,
      timeout
    });
  }

  /**
   * Show custom toast message
   */
  showCustom(title: string, description: string, timeout: number = environment.toastTimeout): void {
    this.addToast({
      type: 'custom',
      title,
      description,
      timeout
    });
  }

  /**
   * Start closing animation for specific toast
   */
  startClosingToast(id: string): void {
    this.toasts.update(current => 
      current.map(toast => 
        toast.id === id ? { ...toast, isClosing: true } : toast
      )
    );
  }

  /**
   * Remove specific toast by ID
   */
  removeToast(id: string): void {
    this.toasts.update(current => current.filter(toast => toast.id !== id));
  }


  /**
   * Add new toast to the queue
   */
  private addToast(toastData: Omit<ToastMessage, 'id'>): void {
    const id = `toast-${++this.toastIdCounter}`;
    const toast: ToastMessage = {
      ...toastData,
      id
    };

    this.toasts.update(current => [...current, toast]);

    // Auto-remove after timeout
    if (toast.timeout && toast.timeout > 0) {
      setTimeout(() => {
        this.startClosingToast(id);
        // Remove from DOM after animation completes
        setTimeout(() => {
          this.removeToast(id);
        }, 300); // Match the CSS transition duration
      }, toast.timeout);
    }
  }
}
