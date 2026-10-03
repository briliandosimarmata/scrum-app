import { Component, computed, inject, signal, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-role-selection',
  imports: [CommonModule],
  templateUrl: './role-selection.html',
  styles: `
    .role-card {
      transition: all 0.3s ease;
    }
    .role-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoleSelection {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = computed(() => this.authService.currentUser());
  showUserMenu = signal(false);

  getInitials(): string {
    const user = this.currentUser();
    if (user == null) return '?';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  }

  getUserFullName(): string {
    const user = this.currentUser();
    if (user == null) return 'User';
    return `${user.firstName} ${user.lastName}`;
  }

  getUserEmail(): string {
    const user = this.currentUser();
    return user?.email || '';
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(show => !show);
  }

  logout(): void {
    this.authService.logout().subscribe();
    this.showUserMenu.set(false);
  }

  selectRole(role: 'project_manager' | 'assignee'): void {
    const user = this.currentUser();
    if (!user) {
      return;
    }

    // Save selected role to session
    this.authService.setSelectedRole(user.id, role);

    if (role === 'project_manager') {
      // Redirect to project list page
      this.router.navigate(['/projects']);
    } else if (role === 'assignee') {
      // For now, do nothing (as per requirements)
      // Later will redirect to assignee dashboard
      this.router.navigate(['/assignee-dashboard']);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.closest('.user-menu-container') == null) {
      this.showUserMenu.set(false);
    }
  }
}