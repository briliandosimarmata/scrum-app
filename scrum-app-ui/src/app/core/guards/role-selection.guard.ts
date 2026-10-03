import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserRoleService } from '../services/user-role.service';
import { firstValueFrom } from 'rxjs';

export const roleSelectionGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const userRoleService = inject(UserRoleService);
  const router = inject(Router);

  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Case 2: Check if role exists in session
  const selectedRole = authService.getSelectedRole(currentUser.id);
  
  if (selectedRole) {
    // Redirect to related role page
    if (selectedRole === 'project_manager') {
      router.navigate(['/projects']);
      return false;
    } else if (selectedRole === 'assignee') {
      router.navigate(['/assignee-dashboard']);
      return false;
    }
  }

  // Case 1: Role not exist in session - fetch user roles
  try {
    const userRoles = await firstValueFrom(userRoleService.getUserRoles());
    
    if (!userRoles) {
      // API failed - default to project manager
      console.warn('Failed to fetch user roles, defaulting to project manager');
      authService.setSelectedRole(currentUser.id, 'project_manager');
      router.navigate(['/projects']);
      return false;
    }

    // If user doesn't have assignee role
    if (!userRoles.isAssignee) {
      // Save project manager role to session and redirect to project list
      authService.setSelectedRole(currentUser.id, 'project_manager');
      router.navigate(['/projects']);
      return false;
    }

    // If user has assignee role - allow access to role selection page (return true)
    return true;

  } catch (error) {
    // API failure - default to project manager
    console.error('Error fetching user roles:', error);
    authService.setSelectedRole(currentUser.id, 'project_manager');
    router.navigate(['/projects']);
    return false;
  }
};
