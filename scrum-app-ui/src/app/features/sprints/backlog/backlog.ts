import { Component, signal, computed, inject, ChangeDetectionStrategy, OnDestroy, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../core/services/task.service';
import { LayoutService } from '../../../core/services/layout.service';
import { DropdownService } from '../../../core/services/dropdown.service';
import { ToastService } from '../../../core/services/toast.service';
import { TaskRequest, TaskResponse, TaskStatus, TaskPriority, DropdownOption } from '../../../shared/interfaces';
import { Subject, takeUntil } from 'rxjs';
import { BacklogTableRowComponent } from './backlog-table-row/backlog-table-row';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown';

@Component({
  selector: 'app-backlog',
  imports: [CommonModule, BacklogTableRowComponent, DropdownComponent],
  templateUrl: './backlog.html',
  styleUrls: ['./backlog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BacklogComponent implements OnDestroy {
  private taskService = inject(TaskService);
  private layoutService = inject(LayoutService);
  private dropdownService = inject(DropdownService);
  private toastService = inject(ToastService);
  private destroy$ = new Subject<void>();

  // Make enums available in template
  TaskStatus = TaskStatus;

  // State
  tasks = signal<TaskResponse[]>([]);
  isLoading = signal<boolean>(false);
  
  // Row-level loading states
  rowLoadingStates = signal<Record<string, boolean>>({});
  
  // Dropdown data for table rows (centralized)
  departmentOptions = signal<DropdownOption[]>([]);
  assigneeOptions = signal<DropdownOption[]>([]);
  dependencyOptions = signal<DropdownOption[]>([]);
  priorityOptions = signal<DropdownOption[]>([]);
  statusOptions = signal<DropdownOption[]>([]);

  constructor() {
    // React to sprint ID changes using effect
    effect(() => {
      const sprintId = this.layoutService.currentSprintId();
      untracked(() => {
        if (sprintId) {
          this.loadTasks();
          this.loadDropdownData(); // Load all dropdown data when sprint ID is available
        } else {
          // Only clear tasks if we had some before
          // Don't clear on initial load when sprint might not be set yet
          if (this.tasks().length > 0) {
            this.tasks.set([]);
          }
          // Clear dropdown data when no sprint is selected
          this.departmentOptions.set([]);
          this.assigneeOptions.set([]);
          this.dependencyOptions.set([]);
          this.priorityOptions.set([]);
          this.statusOptions.set([]);
        }
      });
    });
  }

  // Filter state
  departmentFilter = signal<string | null>(null);
  assigneeFilter = signal<string | null>(null);
  priorityFilter = signal<TaskPriority | null>(null);
  statusFilter = signal<TaskStatus | null>(null);
  showClosed = signal<boolean>(true);

  // Pagination state
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);

  // Computed filter options for page filters (different from table row dropdowns)
  filterDepartmentOptions = computed(() => {
    const allOption: DropdownOption = { id: null, name: 'All Departments', displayName: 'All Departments' };
    return [allOption, ...this.departmentOptions()];
  });

  filterAssigneeOptions = computed(() => {
    const departmentFilter = this.departmentFilter();
    let assignees = this.assigneeOptions();
    
    if (departmentFilter) {
      assignees = assignees.filter(assignee => assignee.metadata?.departmentId === departmentFilter);
    }
    
    const allOption: DropdownOption = { id: null, name: 'All Assignees', displayName: 'All Assignees' };
    return [allOption, ...assignees];
  });

  filterPriorityOptions = computed(() => {
    const allOption: DropdownOption = { id: null, name: 'All Priorities', displayName: 'All Priorities' };
    return [allOption, ...this.priorityOptions()];
  });

  filterStatusOptions = computed(() => {
    const allOption: DropdownOption = { id: null, name: 'All Statuses', displayName: 'All Statuses' };
    return [allOption, ...this.filteredStatusOptions()];
  });

  // Computed display text for filters
  departmentFilterText = computed(() => {
    const filter = this.departmentFilter();
    if (filter == null) return 'All Departments';
    const dept = this.filterDepartmentOptions().find(d => d.id === filter);
    return dept?.name || 'All Departments';
  });

  assigneeFilterText = computed(() => {
    const filter = this.assigneeFilter();
    if (filter == null) return 'All Assignees';
    const assignee = this.filterAssigneeOptions().find(a => a.id === filter);
    return assignee?.name || 'All Assignees';
  });

  priorityFilterText = computed(() => {
    const filter = this.priorityFilter();
    if (filter == null) return 'All Priorities';
    const priority = this.priorityOptions().find(p => p.id === filter);
    return priority?.name || 'All Priorities';
  });

  statusFilterText = computed(() => {
    const filter = this.statusFilter();
    if (filter == null) return 'All Statuses';
    const status = this.statusOptions().find(s => s.id === filter);
    return status?.name || 'All Statuses';
  });

  // Filtered status options (excluding closed)
  filteredStatusOptions = computed(() => {
    return this.statusOptions().filter(s => s.id !== TaskStatus.CLOSED);
  });

  // Computed properties
  filteredTasks = computed(() => {
    const tasks = this.tasks();
    const departmentFilter = this.departmentFilter();
    const assigneeFilter = this.assigneeFilter();
    const priorityFilter = this.priorityFilter();
    const statusFilter = this.statusFilter();
    const showClosed = this.showClosed();

    return tasks.filter(task => {
      const show = showClosed || task.status !== TaskStatus.CLOSED;
      const deptMatch = departmentFilter == null || task.departmentId === departmentFilter;
      const assigneeMatch = assigneeFilter == null || task.assigneeId === assigneeFilter;
      const priorityMatch = priorityFilter == null || task.priority === priorityFilter;
      const statusMatch = statusFilter == null || task.status === statusFilter;

      return show && deptMatch && assigneeMatch && priorityMatch && statusMatch;
    });
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredTasks().length / this.itemsPerPage());
  });

  paginatedTasks = computed(() => {
    const filtered = this.filteredTasks();
    const currentPage = this.currentPage();
    const itemsPerPage = this.itemsPerPage();
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return filtered.slice(startIndex, endIndex);
  });

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTasks(): void {
    this.isLoading.set(true);
    
    const sprintId = this.layoutService.getCurrentSprintId();
    const projectId = this.layoutService.getCurrentProjectId();
    
    if (sprintId == null) {
      this.toastService.showError('No sprint selected. Tasks cannot be loaded.');
      this.isLoading.set(false);
      return;
    }
    
    if (projectId == null) {
      this.toastService.showError('No project selected. Tasks cannot be loaded.');
      this.isLoading.set(false);
      return;
    }
    
    this.taskService.getTasksBySprint(sprintId, projectId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.tasks.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        this.toastService.showError(error.message || 'Failed to load tasks');
        this.isLoading.set(false);
      }
    });
  }

  private loadDropdownData(): void {
    const projectId = this.layoutService.getCurrentProjectId();
    if (projectId == null) {
      this.toastService.showError('No project selected');
      return;
    }

    // Load departments
    this.dropdownService.getDepartmentsByProject(projectId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.departmentOptions.set(response.data);
        } else {
          this.toastService.showError(response.message || 'Failed to load departments');
        }
      },
      error: (error: any) => {
        this.toastService.showError(error.message || 'Failed to load departments');
      }
    });

    // Load assignees
    this.dropdownService.getAssigneesByProject(projectId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.assigneeOptions.set(response.data);
        } else {
          this.toastService.showError(response.message || 'Failed to load assignees');
        }
      },
      error: (error: any) => {
        this.toastService.showError(error.message || 'Failed to load assignees');
      }
    });

    // Load priorities
    this.dropdownService.getPriorityOptions().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.priorityOptions.set(response.data);
        } else {
          this.toastService.showError(response.message || 'Failed to load priorities');
        }
      },
      error: (error: any) => {
        this.toastService.showError(error.message || 'Failed to load priorities');
      }
    });

    // Load statuses
    this.dropdownService.getStatusOptions().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.statusOptions.set(response.data);
        } else {
          this.toastService.showError(response.message || 'Failed to load statuses');
        }
      },
      error: (error: any) => {
        this.toastService.showError(error.message || 'Failed to load statuses');
      }
    });

    // Load dependencies (tasks for dependency dropdown)
    this.loadDependencyOptions();
  }

  private loadDependencyOptions(): void {
    const sprintId = this.layoutService.getCurrentSprintId();
    const projectId = this.layoutService.getCurrentProjectId();

    if (sprintId == null || projectId == null) return;

    this.dropdownService.getTasksBySprintId(sprintId, projectId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.dependencyOptions.set(response.data);
        }
      },
      error: (error: any) => {
        this.toastService.showError(error.message || 'Failed to load task dependencies');
      }
    });
  }

  onAddTask(): void {
    const sprintId = this.layoutService.getCurrentSprintId();
    const projectId = this.layoutService.getCurrentProjectId();
    
    if (sprintId == null || projectId == null) {
      this.toastService.showError('No sprint or project selected. Cannot add task.');
      return;
    }

    // Create new task with default values
    const newTaskData: TaskRequest = {
      sprintId: sprintId,
      description: '',
      priority: TaskPriority.MEDIUM,
      storyPoints: 1,
      status: TaskStatus.TODO,
    };

    this.taskService.createTask(newTaskData, projectId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          // Reload tasks to show the new task
          this.tasks.set([response.data, ...this.tasks()]);
          // Reset to first page to show the new task
          this.currentPage.set(1);
          this.loadDependencyOptions();
        } else {
          this.toastService.showError(response.message || 'Failed to create task');
        }
      },
      error: (error: any) => {
        this.toastService.showError(error.message || 'Failed to create task');
      }
    });
  }

  onFilterChange(filterType: string, value: any): void {
    switch (filterType) {
      case 'department':
        this.departmentFilter.set(value);
        break;
      case 'assignee':
        this.assigneeFilter.set(value);
        break;
      case 'priority':
        this.priorityFilter.set(value);
        break;
      case 'status':
        this.statusFilter.set(value);
        break;
      case 'showClosed':
        this.showClosed.set(value);
        break;
    }
    this.currentPage.set(1); // Reset to first page when filters change
  }

  onPageChange(page: number | string): void {
    if (typeof page === 'number') {
      this.currentPage.set(page);
    }
  }

  onPageSizeChange(size: string | number | null): void {
    if (typeof size === 'number') {
      this.itemsPerPage.set(size);
      this.currentPage.set(1);
    }
  }

  // Enhanced pagination methods
  goToFirstPage(): void {
    this.currentPage.set(1);
  }

  goToLastPage(): void {
    this.currentPage.set(this.totalPages());
  }

  goToPreviousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  goToNextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  // Pagination page numbers for display
  getPageNumbers(): (number | string)[] {
    const current = this.currentPage();
    const total = this.totalPages();
    const pages: (number | string)[] = [];
    
    if (total <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (current <= 4) {
        // Show first 5 pages, then ellipsis, then last page
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 3) {
        // Show first page, ellipsis, then last 5 pages
        pages.push('...');
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
        pages.push('...');
        pages.push(current - 1);
        pages.push(current);
        pages.push(current + 1);
        pages.push('...');
        pages.push(total);
      }
    }
    
    return pages;
  }

  // Helper method for template
  getMinValue(a: number, b: number): number {
    return Math.min(a, b);
  }

  // Row loading state management
  setRowLoading(taskId: string, loading: boolean): void {
    const currentStates = this.rowLoadingStates();
    this.rowLoadingStates.set({
      ...currentStates,
      [taskId]: loading
    });
  }

  isRowLoading(taskId: string): boolean {
    return this.rowLoadingStates()[taskId] || false;
  }

  // Event handlers for row component
  onTaskUpdated(updatedTask: TaskResponse): void {
    this.setRowLoading(updatedTask.id, true);
    
    const projectId = this.layoutService.getCurrentProjectId();
    if (projectId == null) {
      this.toastService.showError('No project selected. Cannot update task.');
      this.setRowLoading(updatedTask.id, false);
      return;
    }
    
    // Convert TaskResponse to TaskRequest for the API call
    const taskRequest: TaskRequest = {
      description: updatedTask.description,
      storyPoints: updatedTask.storyPoints,
      status: updatedTask.status,
      priority: updatedTask.priority,
      sprintId: updatedTask.sprintId,
      assigneeId: updatedTask.assigneeId,
      departmentId: updatedTask.departmentId,
      dependencyTaskId: updatedTask.dependencyTaskId
    };
    
    this.taskService.updateTask(updatedTask.id, taskRequest, projectId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          const updatedTasks = this.tasks().map(task => task.id === updatedTask.id ? response.data : task);
          this.tasks.set(updatedTasks);
          this.loadDependencyOptions();
        } else {
          this.toastService.showError(response.message || 'Failed to update task');
        }
        this.setRowLoading(updatedTask.id, false);
      },
      error: (error: any) => {
        this.toastService.showError(error.message || 'Failed to update task');
        this.setRowLoading(updatedTask.id, false);
      }
    });
  }

  onTaskDeleted(taskId: string): void {
    this.setRowLoading(taskId, true);
    
    const projectId = this.layoutService.getCurrentProjectId();
    if (projectId == null) {
      this.toastService.showError('No project selected. Cannot delete task.');
      this.setRowLoading(taskId, false);
      return;
    }
    
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId, projectId).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.tasks.set(this.tasks().filter(task => task.id !== taskId));
            this.loadDependencyOptions();
          } else {
            this.toastService.showError(response.message || 'Failed to delete task');
          }
          this.setRowLoading(taskId, false);
        },
        error: (error: any) => {
          this.toastService.showError(error.message || 'Failed to delete task');
          this.setRowLoading(taskId, false);
        }
      });
    } else {
      this.setRowLoading(taskId, false);
    }
  }

  onTaskClosed(taskId: string): void {
    this.setRowLoading(taskId, true);
    
    const projectId = this.layoutService.getCurrentProjectId();
    if (projectId == null) {
      this.toastService.showError('No project selected. Cannot close task.');
      this.setRowLoading(taskId, false);
      return;
    }
    
    const task = this.tasks().find(t => t.id === taskId);
    if (task) {
      // Convert TaskResponse to TaskRequest for the API call
      const taskRequest: TaskRequest = {
        description: task.description,
        storyPoints: task.storyPoints,
        status: TaskStatus.CLOSED,
        priority: task.priority,
        sprintId: task.sprintId,
        assigneeId: task.assigneeId,
        departmentId: task.departmentId,
        dependencyTaskId: task.dependencyTaskId
      };
      
      this.taskService.updateTask(taskId, taskRequest, projectId).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            const updatedTasks = this.tasks().map(task => task.id === taskId ? response.data : task);
            this.tasks.set(updatedTasks);
            this.loadDependencyOptions();
          } else {
            this.toastService.showError(response.message || 'Failed to close task');
          }
          this.setRowLoading(taskId, false);
        },
        error: (error: any) => {
          this.toastService.showError(error.message || 'Failed to close task');
          this.setRowLoading(taskId, false);
        }
      });
    } else {
      this.setRowLoading(taskId, false);
    }
  }
}
