import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { LayoutService } from '../services/layout.service';
import { AuthService } from '../services/auth.service';

export const projectGuard: CanActivateFn = (route, state) => {
  const projectService = inject(ProjectService);
  const layoutService = inject(LayoutService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user has PROJECT_MANAGER role
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    router.navigate(['/auth/login']);
    return false;
  }

  const selectedRole = authService.getSelectedRole(currentUser.id);
  if (selectedRole !== 'project_manager') {
    router.navigate(['/role-selection']);
    return false;
  }

  const projectCode = route.paramMap.get('projectCode');
  
  if (projectCode == null || projectCode === '') {
    router.navigate(['/projects'], { 
      queryParams: { error: 'Project code is required' }
    });
    return false;
  }

  // Validate project existence by code
  return new Promise<boolean>((resolve) => {
    projectService.getProjectByCode(projectCode).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const project = response.data;
          const currentProjectId = layoutService.getCurrentProjectId();
          
          // Check if the same project is already cached
          if (currentProjectId === project.id) {
            resolve(true); // Project already validated and cached
          } else {
            // Cache the validated project
            layoutService.setCurrentProject(project);
            resolve(true);
          }
        } else {
          // Project not found
          router.navigate(['/projects'], { 
            queryParams: { error: 'Project not found' }
          });
          resolve(false);
        }
      },
      error: () => {
        // API error
        router.navigate(['/projects'], { 
          queryParams: { error: 'Failed to validate project' }
        });
        resolve(false);
      }
    });
  });
};
