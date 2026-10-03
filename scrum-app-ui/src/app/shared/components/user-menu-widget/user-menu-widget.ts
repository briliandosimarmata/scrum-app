import { Component, computed, inject, ChangeDetectionStrategy, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-menu-widget',
  imports: [CommonModule],
  templateUrl: './user-menu-widget.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserMenuWidgetComponent {
  private authService = inject(AuthService);

  currentUser = computed(() => this.authService.currentUser());
  showUserMenu = signal(false);

  getInitials(): string {
    const user = this.currentUser();
    if (user == null) return '?';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(show => !show);
  }

  logout(): void {
    this.authService.logout().subscribe();
    this.showUserMenu.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.closest('.user-menu-container') == null) {
      this.showUserMenu.set(false);
    }
  }
}
