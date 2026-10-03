import { Component, signal, computed, inject, OnDestroy, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { TimelineService } from '../../../core/services/timeline.service';
import { DropdownService } from '../../../core/services/dropdown.service';
import { LayoutService } from '../../../core/services/layout.service';
import { ToastService } from '../../../core/services/toast.service';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown';
import { 
  SprintTimelineData, 
  TaskBarItem, 
  TimelineDate, 
  DropdownOption,
  TaskStatus,
  TaskPriority
} from '../../../shared/interfaces';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, DropdownComponent],
  templateUrl: './timeline.html',
  styleUrl: './timeline.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineComponent implements OnDestroy {
  private timelineService = inject(TimelineService);
  private dropdownService = inject(DropdownService);
  private layoutService = inject(LayoutService);
  private toastService = inject(ToastService);
  private destroy$ = new Subject<void>();

  constructor() {
    // Use effects to reactively load data when IDs become available
    effect(() => {
      const projectId = this.layoutService.getCurrentProjectId();
      if (projectId) {
        this.loadDepartmentOptions();
      }

      const sprintId = this.layoutService.getCurrentSprintId();
      if (sprintId) {
        this.loadTimelineData();
      }
    });
  }

  // State signals
  isLoading = signal(false);
  timelineData = signal<SprintTimelineData | null>(null);
  departmentFilter = signal<string | null>(null);
  departmentOptions = signal<DropdownOption[]>([]);

  // Computed properties
  filteredTaskColumn = computed(() => {
    const data = this.timelineData();
    const departmentFilter = this.departmentFilter();
    
    if (data == null) return [];
    
    if (departmentFilter) {
      return data.taskColumn.filter(task => task.departmentId === departmentFilter);
    }
    
    return data.taskColumn;
  });

  filteredTaskBars = computed(() => {
    const data = this.timelineData();
    const departmentFilter = this.departmentFilter();
    
    if (data == null) return [];
    
    if (departmentFilter) {
      return data.taskBars.filter(task => task.departmentId === departmentFilter);
    }
    
    return data.taskBars;
  });

  dateRange = computed(() => {
    const data = this.timelineData();
    if (data == null) return [];
    
    return this.generateDateRange(data.startDate, data.endDate, data.holidays);
  });

  monthGroups = computed(() => {
    const dates = this.dateRange();
    const groups: { [key: string]: { start: number; count: number } } = {};
    
    dates.forEach((date, index) => {
      if (groups[date.month] == null) {
        groups[date.month] = { start: index + 1, count: 0 };
      }
      groups[date.month].count++;
    });
    
    return groups;
  });

  // Empty state detection
  hasSprintSelected = computed(() => !!this.layoutService.getCurrentSprintId());
  
  hasTimelineData = computed(() => {
    const data = this.timelineData();
    return data && (data.taskColumn.length > 0 || data.taskBars.length > 0);
  });

  emptyStateType = computed(() => {
    if (this.isLoading()) return 'loading';
    if (!this.hasSprintSelected()) return 'no-sprint';
    if (!this.hasTimelineData()) return 'no-tasks';
    return 'none';
  });

  // Dropdown configuration
  departmentDropdownConfig = computed(() => ({
    type: 'department',
    isSearchable: true,
    placeholder: 'All Departments'
  }));

  // Department dropdown options with "All Departments" option
  departmentDropdownOptions = computed(() => {
    const departments = this.departmentOptions();
    const allOption: DropdownOption = { 
      id: null, 
      name: 'All Departments', 
      displayName: 'All Departments' 
    };
    return [allOption, ...departments];
  });

  // Selected department display text
  selectedDepartmentText = computed(() => {
    const selected = this.departmentDropdownOptions().find(opt => opt.id === this.departmentFilter());
    return selected?.displayName || 'All Departments';
  });


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDepartmentOptions(): void {
    const projectId = this.layoutService.getCurrentProjectId();
    if (projectId == null) {
      this.toastService.showError('No project selected');
      return;
    }

    this.dropdownService.getDepartmentsByProject(projectId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.departmentOptions.set(response.data);
        } else {
          this.toastService.showError(response.message || 'Failed to load departments');
        }
      },
      error: (error) => {
        this.toastService.showError(error.message || 'Failed to load departments');
      }
    });
  }

  private loadTimelineData(): void {
    this.isLoading.set(true);
    
    // Get project ID and sprint ID from LayoutService
    const projectId = this.layoutService.getCurrentProjectId();
    const sprintId = this.layoutService.getCurrentSprintId();
    
    if (projectId == null) {
      this.toastService.showError('No project selected');
      this.isLoading.set(false);
      return;
    }
    
    if (sprintId == null) {
      this.toastService.showError('No sprint selected');
      this.isLoading.set(false);
      return;
    }
    
    this.timelineService.getSprintTimeline(projectId, sprintId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          console.log('response.data', response.data);
          this.timelineData.set(response.data);
        } else {
          this.toastService.showError(response.message || 'Failed to load timeline data');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        this.toastService.showError(error.message || 'Failed to load timeline data');
        this.isLoading.set(false);
      }
    });
  }

  onDepartmentFilterChange(departmentId: string | number | null): void {
    this.departmentFilter.set(departmentId as string | null);
  }

  // Helper methods for template
  getInitials(name: string): string {
    if (name == null || name === '') return '?';
    const parts = name.split(' ').filter(p => p);
    if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    if (parts.length === 1 && parts[0].length > 1) return (parts[0][0] + parts[0][1]).toUpperCase();
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return '?';
  }

  getAvatarColor(name: string): string {
    const colors = ['bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-indigo-500', 'bg-pink-500', 'bg-yellow-500', 'bg-teal-500'];
    if (name == null || name === '') return 'bg-gray-400';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash % colors.length)];
  }

  getStatusColor(status: TaskStatus): string {
    const statusColors = {
      [TaskStatus.TODO]: 'bg-gray-500',
      [TaskStatus.IN_PROGRESS]: 'bg-blue-500',
      [TaskStatus.DONE]: 'bg-green-500',
      [TaskStatus.CLOSED]: 'bg-red-400'
    };
    return statusColors[status] || 'bg-gray-500';
  }


  private generateDateRange(startDate: string, endDate: string, holidays: string[]): TimelineDate[] {
    const dates: TimelineDate[] = [];
    let currentDate = new Date(startDate + 'T00:00:00');
    const lastDate = new Date(endDate + 'T00:00:00');
    
    while (currentDate <= lastDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();
      const isHoliday = holidays.includes(dateString);
      
      dates.push({
        date: dateString,
        dayOfWeek,
        dayName: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
        isHoliday,
        month: currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' }),
        monthIndex: currentDate.getMonth()
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }

  getTaskBarPosition(taskBar: TaskBarItem): { gridRow: number; gridColumn: string } {
    const taskColumn = this.filteredTaskColumn();
    const taskIndex = taskColumn.findIndex(task => task.id === taskBar.id);
    
    if (taskIndex === -1) {
      return { gridRow: 1, gridColumn: '1' };
    }
    
    const rowPosition = taskIndex + 3; // +3 because of month and date headers
    
    const dates = this.dateRange();
    const startIndex = dates.findIndex(d => d.date === taskBar.startDate);
    const endIndex = dates.findIndex(d => d.date === taskBar.endDate);
    
    if (startIndex === -1 || endIndex === -1) {
      return { gridRow: rowPosition, gridColumn: '1' };
    }
    
    return {
      gridRow: rowPosition,
      gridColumn: `${startIndex + 1} / ${endIndex + 2}`
    };
  }

  logRendering(): void {
    console.log('Rendering timeline');
  }
}
