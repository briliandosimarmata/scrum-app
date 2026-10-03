import { Component, signal, computed, inject, ChangeDetectionStrategy, OnInit, OnDestroy, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { DepartmentService } from '../../../core/services/department.service';
import { LayoutService } from '../../../core/services/layout.service';
import { ToastService } from '../../../core/services/toast.service';
import { DropdownService } from '../../../core/services/dropdown.service';
import { DepartmentTasksResponse, DropdownOption } from '../../../shared/interfaces';
import { DepartmentSummaryComponent } from './department-summary/department-summary';
import { DepartmentTasksTableComponent } from './department-tasks-table/department-tasks-table';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown';

@Component({
  selector: 'app-department-tasks',
  standalone: true,
  imports: [CommonModule, DepartmentSummaryComponent, DepartmentTasksTableComponent, DropdownComponent],
  templateUrl: './department-tasks.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepartmentTasksComponent implements OnInit, OnDestroy {
  // State signals
  departmentOptions = signal<DropdownOption[]>([]);
  selectedDepartmentId = signal<string | null>(null);
  departmentData = signal<DepartmentTasksResponse | null>(null);
  isLoading = signal(false);

  // Computed signals
  hasDepartments = computed(() => this.departmentOptions().length > 0);
  hasDepartmentData = computed(() => this.departmentData() !== null);
  hasTasks = computed(() => (this.departmentData()?.tasks.length || 0) > 0);
  hasSprintId = computed(() => !!this.layoutService.currentSprintId());

  // Dropdown configuration
  departmentDropdownConfig = computed(() => ({
    type: 'department',
    isSearchable: true,
    placeholder: 'Select Department'
  }));

  // Selected department display text
  selectedDepartmentText = computed(() => {
    const selected = this.departmentOptions().find(opt => opt.id === this.selectedDepartmentId());
    return selected?.displayName || 'Select Department';
  });

  private destroy$ = new Subject<void>();
  private departmentService = inject(DepartmentService);
  private layoutService = inject(LayoutService);
  private toastService = inject(ToastService);
  private dropdownService = inject(DropdownService);

  constructor() {
    // React to sprint ID changes using effect
    effect(() => {
      const sprintId = this.layoutService.currentSprintId();
      untracked(() => {
        if (sprintId && this.selectedDepartmentId()) {
          // Reload department tasks when sprint ID becomes available or changes
          this.loadDepartmentTasks(this.selectedDepartmentId()!, sprintId);
        } else if (sprintId == null) {
          // Clear department data when no sprint is selected
          this.departmentData.set(null);
        }
      });
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDepartments(): void {
    const projectId = this.layoutService.currentProjectId();
    if (projectId == null) {
      this.toastService.showError('No project selected');
      return;
    }

    this.isLoading.set(true);
    this.dropdownService.getDepartmentsByProject(projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.departmentOptions.set(response.data);
            if (response.data.length > 0) {
              // Set first department as default
              this.selectedDepartmentId.set(response.data[0].id as string);
              // Only load department tasks if sprint ID is available
              const sprintId = this.layoutService.currentSprintId();
              if (sprintId) {
                this.loadDepartmentTasks(response.data[0].id as string, sprintId);
              }
            }
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          this.toastService.showError('Failed to load departments');
          this.isLoading.set(false);
        }
      });
  }

  loadDepartmentTasks(departmentId: string, sprintId: string): void {
    const projectId = this.layoutService.currentProjectId();
    if (projectId == null) {
      this.toastService.showError('No project selected');
      return;
    }

    this.isLoading.set(true);
    this.departmentService.getDepartmentTasks(projectId, departmentId, sprintId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.departmentData.set(response.data);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.toastService.showError('Failed to load department tasks');
          this.departmentData.set(null);
          this.isLoading.set(false);
        }
      });
  }

  onDepartmentFilterChange(departmentId: string | number | null): void {
    if (typeof departmentId === 'string') {
      this.selectedDepartmentId.set(departmentId);
      // Only load department tasks if sprint ID is available
      const sprintId = this.layoutService.currentSprintId();
      if (sprintId) {
        this.loadDepartmentTasks(departmentId, sprintId);
      }
    }
  }
}
