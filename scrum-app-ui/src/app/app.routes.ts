import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { projectGuard } from './core/guards/project.guard';
import { projectRoleGuard } from './core/guards/project-role.guard';
import { assigneeGuard } from './core/guards/assignee.guard';
import { assigneeSprintGuard } from './core/guards/assignee-sprint.guard';
import { roleSelectionGuard } from './core/guards/role-selection.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/role-selection',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'role-selection',
    canActivate: [authGuard, roleSelectionGuard],
    loadComponent: () =>
      import('./features/auth/role-selection/role-selection').then((m) => m.RoleSelection),
  },
  {
    path: 'assignee-dashboard',
    canActivate: [authGuard, assigneeGuard],
    loadComponent: () =>
      import('./features/assignee/assignee-dashboard/assignee-dashboard').then((m) => m.AssigneeDashboardComponent),
    children: [
      {
        path: '',
        redirectTo: 'sprints',
        pathMatch: 'full',
      },
      {
        path: 'sprints',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/assignee/sprints/sprints').then((m) => m.SprintsComponent),
          },
          {
            path: ':sprintId',
            loadComponent: () =>
              import('./features/assignee/layout/assignee-main-layout').then((m) => m.AssigneeMainLayoutComponent),
            canActivate: [assigneeSprintGuard],
            children: [
              {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full',
              },
              {
                path: 'dashboard',
                loadComponent: () =>
                  import('./features/assignee/dashboard/dashboard').then((m) => m.AssigneeDashboardPageComponent),
              },
              {
                path: 'my-tasks',
                       loadComponent: () =>
                         import('./features/assignee/my-tasks/my-tasks').then((m) => m.AssigneeMyTasksComponent),
              },
              {
                path: 'timeline',
                loadComponent: () =>
                  import('./features/assignee/timeline/timeline').then((m) => m.AssigneeTimelineComponent),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: 'projects',
    canActivate: [authGuard, projectRoleGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/projects/project-list/project-list').then(
            (m) => m.ProjectListComponent
          ),
      },
      {
        path: ':projectCode',
        loadComponent: () =>
          import('./features/layout/main-layout/main-layout').then((m) => m.MainLayoutComponent),
        canActivate: [projectGuard],
        children: [
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full',
          },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
            data: { title: 'Dashboard' },
          },
          {
            path: 'masters',
            children: [
              {
                path: 'assignee',
                title: 'Assignees',
                loadComponent: () =>
                  import('./features/masters/assignee/assignee').then((m) => m.AssigneeComponent),
                data: { title: 'Assignees' },
              },
              {
                path: 'department',
                loadComponent: () =>
                  import('./features/masters/department/department/department').then(
                    (m) => m.DepartmentComponent
                  ),
                data: { title: 'Departments' },
              },
            ],
          },
          {
            path: 'sprints',
            children: [
              {
                path: 'backlog',
                loadComponent: () =>
                  import('./features/sprints/backlog/backlog').then((m) => m.BacklogComponent),
                data: { title: 'Backlog' },
              },
              {
                path: 'department-tasks',
                loadComponent: () =>
                  import('./features/sprints/department-tasks/department-tasks').then(
                    (m) => m.DepartmentTasksComponent
                  ),
                data: { title: 'Department Tasks' },
              },
              {
                path: 'assignee-tasks',
                loadComponent: () =>
                  import('./features/sprints/assignee-tasks/assignee-tasks').then(
                    (m) => m.AssigneeTasksComponent
                  ),
                data: { title: 'Assignee Tasks' },
              },
              {
                path: 'timeline',
                loadComponent: () =>
                  import('./features/sprints/timeline/timeline').then((m) => m.TimelineComponent),
                data: { title: 'Timeline' },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/projects',
  },
];
