import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { SprintService } from '../services/sprint.service';
import { AssigneeLayoutService } from '../services/assignee-layout.service';
import { firstValueFrom } from 'rxjs';

export const assigneeSprintGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const sprintService = inject(SprintService);
  const assigneeLayoutService = inject(AssigneeLayoutService);
  const router = inject(Router);

  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Check if user has ASSIGNEE role
  const selectedRole = authService.getSelectedRole(currentUser.id);
  if (selectedRole !== 'assignee') {
    router.navigate(['/role-selection']);
    return false;
  }

  // Get sprintId from route parameter
  const sprintId = route.paramMap.get('sprintId');
  if (!sprintId) {
    router.navigate(['/assignee-dashboard/sprints']);
    return false;
  }

  // Check if sprint is already cached and matches
  const cachedSprintId = assigneeLayoutService.getCurrentSprintId();
  if (cachedSprintId === sprintId) {
    return true; // Sprint already validated and cached
  }

  // Validate sprint access and fetch sprint details
  try {
    const response = await firstValueFrom(sprintService.getAssigneeSprintById(sprintId));

    if (response.success && response.data) {
      // Cache the validated sprint
      assigneeLayoutService.setCurrentSprint(response.data);
      return true;
    } else {
      // Sprint not found or no access
      console.error('Sprint access denied:', response.message);
      router.navigate(['/assignee-dashboard/sprints'], {
        queryParams: { error: 'Sprint not found or access denied' }
      });
      return false;
    }
  } catch (error) {
    // API error
    console.error('Error validating sprint access:', error);
    router.navigate(['/assignee-dashboard/sprints'], {
      queryParams: { error: 'Failed to validate sprint access' }
    });
    return false;
  }
};

