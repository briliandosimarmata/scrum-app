import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'app-toast-container',
  imports: [CommonModule, ToastComponent],
  templateUrl: './toast-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastContainerComponent {
  private toastService = inject(ToastService);

  // Get toasts from service
  toasts = this.toastService.toasts$;

  onCloseToast(toastId: string): void {
    this.toastService.removeToast(toastId);
  }
}
