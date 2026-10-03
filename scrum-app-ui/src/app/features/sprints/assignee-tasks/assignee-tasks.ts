import { Component, signal, computed, inject, ChangeDetectionStrategy, OnInit, OnDestroy, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AssigneeService } from '../../../core/services/assignee.service';
import { LayoutService } from '../../../core/services/layout.service';
import { ToastService } from '../../../core/services/toast.service';
import { DropdownService } from '../../../core/services/dropdown.service';
import { AssigneeTasksResponse, DropdownOption } from '../../../shared/interfaces';
import { AssigneeSummaryComponent } from './assignee-summary/assignee-summary';
import { AssigneeTasksTableComponent } from './assignee-tasks-table/assignee-tasks-table';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown';

@Component({
  selector: 'app-assignee-tasks',
  standalone: true,
  imports: [CommonModule, AssigneeSummaryComponent, AssigneeTasksTableComponent, DropdownComponent],
  templateUrl: './assignee-tasks.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssigneeTasksComponent implements OnInit, OnDestroy {
  // State signals
  assigneeOptions = signal<DropdownOption[]>([]);
  selectedAssigneeId = signal<string | null>(null);
  assigneeData = signal<AssigneeTasksResponse | null>(null);
  isLoading = signal(false);

  // Computed signals
  hasAssignees = computed(() => this.assigneeOptions().length > 0);
  hasAssigneeData = computed(() => this.assigneeData() !== null);
  hasTasks = computed(() => (this.assigneeData()?.tasks.length || 0) > 0);
  hasSprintId = computed(() => !!this.layoutService.currentSprintId());

  // Dropdown configuration
  assigneeDropdownConfig = computed(() => ({
    type: 'assignee',
    isSearchable: true,
    placeholder: 'Select Assignee'
  }));

  // Selected assignee display text
  selectedAssigneeText = computed(() => {
    const selected = this.assigneeOptions().find(opt => opt.id === this.selectedAssigneeId());
    return selected?.displayName || 'Select Assignee';
  });

  private destroy$ = new Subject<void>();
  private assigneeService = inject(AssigneeService);
  private layoutService = inject(LayoutService);
  private toastService = inject(ToastService);
  private dropdownService = inject(DropdownService);

  constructor() {
    // React to sprint ID changes using effect
    effect(() => {
      const sprintId = this.layoutService.currentSprintId();
      untracked(() => {
        if (sprintId && this.selectedAssigneeId()) {
          // Reload assignee tasks when sprint ID becomes available or changes
          this.loadAssigneeTasks(this.selectedAssigneeId()!, sprintId);
        } else if (sprintId == null) {
          // Clear assignee data when no sprint is selected
          this.assigneeData.set(null);
        }
      });
    });
  }

  ngOnInit(): void {
    this.loadAssignees();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAssignees(): void {
    const projectId = this.layoutService.currentProjectId();
    if (projectId == null) {
      this.toastService.showError('No project selected');
      return;
    }

    this.isLoading.set(true);
    this.dropdownService.getAssigneesByProject(projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.assigneeOptions.set(response.data);
            if (response.data.length > 0) {
              // Set first assignee as default
              this.selectedAssigneeId.set(response.data[0].id as string);
              // Only load assignee tasks if sprint ID is available
              const sprintId = this.layoutService.currentSprintId();
              if (sprintId) {
                this.loadAssigneeTasks(response.data[0].id as string, sprintId);
              }
            }
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          this.toastService.showError('Failed to load assignees');
          this.isLoading.set(false);
        }
      });
  }

  loadAssigneeTasks(assigneeId: string, sprintId: string): void {
    const projectId = this.layoutService.currentProjectId();
    if (projectId == null) {
      this.toastService.showError('No project selected');
      return;
    }

    this.isLoading.set(true);
    this.assigneeService.getAssigneeTasks(projectId, assigneeId, sprintId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.assigneeData.set(response.data);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.toastService.showError('Failed to load assignee tasks');
          this.assigneeData.set(null);
          this.isLoading.set(false);
        }
      });
  }

  onAssigneeFilterChange(assigneeId: string | number | null): void {
    if (typeof assigneeId === 'string') {
      this.selectedAssigneeId.set(assigneeId);
      // Only load assignee tasks if sprint ID is available
      const sprintId = this.layoutService.currentSprintId();
      if (sprintId) {
        this.loadAssigneeTasks(assigneeId, sprintId);
      }
    }
  }

  onTasksReloaded(): void {
    // Reload assignee tasks after successful reordering
    const assigneeId = this.selectedAssigneeId();
    const sprintId = this.layoutService.currentSprintId();
    const projectId = this.layoutService.currentProjectId();
    
    if (assigneeId && sprintId && projectId) {
      this.assigneeService.getAssigneeTasks(projectId, assigneeId, sprintId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.assigneeData.set(response.data);
        },
        error: (error) => {
          this.toastService.showError('Failed to load assignee tasks');
          this.assigneeData.set(null);
        }
      });
    }
  }
}