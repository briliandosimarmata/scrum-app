import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const assigneeGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Check if user has ASSIGNEE role
  const selectedRole = authService.getSelectedRole(currentUser.id);
  
  if (selectedRole === 'assignee') {
    return true; // Allow access
  }

  // User doesn't have assignee role, redirect to role selection
  router.navigate(['/role-selection']);
  return false;
};
