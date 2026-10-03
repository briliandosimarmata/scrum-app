import { Component, ChangeDetectionStrategy, inject, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SprintService } from '../../../core/services/sprint.service';
import { ToastService } from '../../../core/services/toast.service';
import { AssigneeTask, EnumUtils, TaskStatus, DropdownConfig } from '../../../shared/interfaces';
import { AssigneeLayoutService } from '../../../core/services/assignee-layout.service';
import { AssigneeTaskCardComponent } from './task-card';

@Component({
  selector: 'app-assignee-my-tasks',
  imports: [CommonModule, AssigneeTaskCardComponent],
  templateUrl: './my-tasks.html',
  styleUrl: './my-tasks.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssigneeMyTasksComponent implements OnInit, OnDestroy {
  // Expose enum to template
  readonly TaskStatus = TaskStatus;
  private route = inject(ActivatedRoute);
  private sprintService = inject(SprintService);
  private toast = inject(ToastService);
  private assigneeLayoutService = inject(AssigneeLayoutService);

  tasks = signal<AssigneeTask[]>([]);
  isLoading = signal(false);
  isLoadingMore = signal(false);
  nextCursor = signal<string | null>(null);
  sprintId = signal<string>('');

  private observer?: IntersectionObserver;

  // Filtered view: hide CLOSED just in case backend returns any
  visibleTasks = computed(() => this.tasks().filter(t => t.status !== 'CLOSED'));

  // Dropdown config for status (TODO, IN_PROGRESS, DONE)
  statusOptions: { id: TaskStatus; name: string }[] = [
    { id: TaskStatus.TODO, name: 'To Do' },
    { id: TaskStatus.IN_PROGRESS, name: 'In Progress' },
    { id: TaskStatus.DONE, name: 'Done' },
  ];
  statusConfig: DropdownConfig = { type: 'status', isSearchable: false, placeholder: 'Update status' };

  ngOnInit(): void {
    const sprintId = this.assigneeLayoutService.currentSprintId();
    
    if (!sprintId) {
      this.toast.showError('No sprint selected');
      return;
    }

    this.sprintId.set(sprintId);
    this.loadFirstPage();
    // Setup infinite scroll observer
    setTimeout(() => this.setupObserver(), 0);
    document.addEventListener('click', this.handleDocumentClick);
    document.addEventListener('keydown', this.handleEscClose);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    document.removeEventListener('click', this.handleDocumentClick);
    document.removeEventListener('keydown', this.handleEscClose);
  }

  private setupObserver(): void {
    const sentinel = document.getElementById('scroll-sentinel');
    if (!sentinel) return;
    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          this.loadNextPage();
        }
      }
    });
    this.observer.observe(sentinel);
  }

  loadFirstPage(): void {
    this.isLoading.set(true);
    this.sprintService.getAssigneeTasks(this.sprintId(), 5)
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.tasks.set(res.data.tasks || []);
            this.nextCursor.set(res.data.nextCursor || null);
          } else {
            this.toast.showError(res.message || 'Failed to load tasks');
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.toast.showError(err?.message || 'Failed to load tasks');
          this.isLoading.set(false);
        }
      });
  }

  loadNextPage(): void {
    if (this.isLoadingMore() || !this.nextCursor()) return;
    this.isLoadingMore.set(true);
    this.sprintService.getAssigneeTasks(this.sprintId(), 5, this.nextCursor() || undefined)
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const existing = this.tasks();
            const incoming = res.data.tasks || [];
            // Dedupe by taskId
            const map = new Map(existing.map(t => [t.taskId, t]));
            for (const t of incoming) map.set(t.taskId, t);
            this.tasks.set(Array.from(map.values()));
            this.nextCursor.set(res.data.nextCursor || null);
          }
          this.isLoadingMore.set(false);
        },
        error: () => {
          this.isLoadingMore.set(false);
        }
      });
  }

  // Optimistic status change
  changeStatus(task: AssigneeTask, newStatus: TaskStatus): void {
    const sprintId = this.sprintId();
    const prevStatus = task.status;
    // optimistic
    this.tasks.set(this.tasks().map(t => t.taskId === task.taskId ? { ...t, status: newStatus } : t));

    this.sprintService.updateAssigneeTaskStatus(sprintId, task.taskId, newStatus)
      .subscribe({
        next: (res) => {
          if (!res.success) {
            // rollback
            this.tasks.set(this.tasks().map(t => t.taskId === task.taskId ? { ...t, status: prevStatus } : t));
            this.toast.showError(res.message || 'Failed to update status');
          } else {
            // If server somehow returns CLOSED later, ensure hidden
            this.tasks.set(this.tasks().filter(t => t.status !== 'CLOSED'));
          }
        },
        error: () => {
          this.tasks.set(this.tasks().map(t => t.taskId === task.taskId ? { ...t, status: prevStatus } : t));
          this.toast.showError('Failed to update status');
        }
      });
  }

  onStatusDropdown(task: AssigneeTask, value: string | number | null) {
    // Accept only TaskStatus string values, ignore if null
    if (typeof value === 'string' && Object.values(TaskStatus).includes(value as TaskStatus)) {
      this.changeStatus(task, value as TaskStatus);
    }
  }

  // Badges helpers sourced from EnumUtils
  getStatusBadgeClass(status: AssigneeTask['status']): string {
    return EnumUtils.getTaskStatusBadgeClass(status as any);
  }

  // --- Dropdown logic ---
  handleDocumentClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown-option') && !target.closest('.status-badge')) {
      // this.openStatusDropdownId.set(null); // Removed local dropdown state
    }
  };

  handleEscClose = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      // this.openStatusDropdownId.set(null); // Removed local dropdown state
    }
  };

  onCardStatusChange({task, status}: {task: AssigneeTask, status: TaskStatus}) {
    this.changeStatus(task, status);
  }

  statusBadgeClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO:
        return 'bg-gray-200 text-gray-800';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-700';
      case TaskStatus.DONE:
        return 'bg-green-100 text-green-700';
      case TaskStatus.CLOSED:
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }
  selectedStatusBadgeClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO:
        return 'bg-gray-100 text-gray-800';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-700';
      case TaskStatus.DONE:
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }
  statusDisplayName(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO:
        return 'To Do';
      case TaskStatus.IN_PROGRESS:
        return 'In Progress';
      case TaskStatus.DONE:
        return 'Done';
      case TaskStatus.CLOSED:
        return 'Closed';
      default:
        return '';
    }
  }
}



