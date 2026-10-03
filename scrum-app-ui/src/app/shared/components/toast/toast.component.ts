import { Component, input, output, ChangeDetectionStrategy, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastMessage } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastComponent implements OnInit, OnDestroy {
  // Inputs
  toast = input.required<ToastMessage>();
  
  // Outputs
  closeToast = output<string>();

  // Component state
  isVisible = signal(false);
  private animationTimeout?: number;
  private closeTimeout?: number;

  ngOnInit(): void {
    // Trigger slide-in animation after component is rendered
    this.animationTimeout = window.setTimeout(() => {
      this.isVisible.set(true);
    }, 10);
  }

  ngOnDestroy(): void {
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
    }
  }

  onClose(): void {
    // Start fade-out animation
    this.isVisible.set(false);
    
    // Wait for animation to complete before emitting close event
    this.closeTimeout = window.setTimeout(() => {
      this.closeToast.emit(this.toast().id);
    }, 300); // Match the CSS transition duration
  }

  getToastClasses(): string {
    const baseClasses = 'mb-3 w-80 max-w-80 min-w-80 h-24 bg-white rounded-lg shadow-lg transition-all duration-300 ease-in-out';
    const typeClasses = {
      'error': 'border-l-4 border-red-500',
      'success': 'border-l-4 border-green-500', 
      'custom': 'border-l-4 border-blue-500'
    };
    
    const visibilityClass = this.isVisible() 
      ? 'translate-x-0 opacity-100' 
      : 'translate-x-full opacity-0';
    
    return `${baseClasses} ${typeClasses[this.toast().type]} ${visibilityClass}`;
  }

  getIconClass(): string {
    const iconMap = {
      'error': 'fa-solid fa-exclamation-circle',
      'success': 'fa-solid fa-check-circle',
      'custom': 'fa-solid fa-info-circle'
    };
    
    return iconMap[this.toast().type];
  }

  getIconColorClass(): string {
    const colorMap = {
      'error': 'text-red-500',
      'success': 'text-green-500',
      'custom': 'text-blue-500'
    };
    
    return colorMap[this.toast().type];
  }

  getTitleColorClass(): string {
    const colorMap = {
      'error': 'text-red-800',
      'success': 'text-green-800',
      'custom': 'text-blue-800'
    };
    
    return colorMap[this.toast().type];
  }
}
