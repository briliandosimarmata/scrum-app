import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const projectRoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Check if user has PROJECT_MANAGER role
  const selectedRole = authService.getSelectedRole(currentUser.id);
  
  if (selectedRole === 'project_manager') {
    return true; // Allow access
  }

  // User doesn't have project manager role, redirect to role selection
  router.navigate(['/role-selection']);
  return false;
};
