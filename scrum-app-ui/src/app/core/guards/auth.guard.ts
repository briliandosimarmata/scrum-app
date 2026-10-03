import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (!authService.isLoggedIn()) {
    // Redirect to login page with return URL
    router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }

  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    router.navigate(['/auth/login']);
    return false;
  }

  // User is authenticated, allow access
  return true;
};