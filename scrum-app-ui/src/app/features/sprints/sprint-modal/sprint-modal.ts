import { Component, input, output, signal, computed, inject, ChangeDetectionStrategy, OnDestroy, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { SprintService } from '../../../core/services/sprint.service';
import { LayoutService } from '../../../core/services/layout.service';
import { ToastService } from '../../../core/services/toast.service';
import { Sprint } from '../../../shared/interfaces';
import { DraggableModal } from '../../../shared/components/draggable-modal/draggable-modal';
import { SprintForm, SprintFormData } from './sprint-form/sprint-form';
import { HolidaySelector } from './holiday-selector/holiday-selector';
import { CalendarDay } from './calendar-day/calendar-day';

@Component({
  selector: 'app-sprint-modal',
  imports: [CommonModule, DraggableModal, SprintForm, HolidaySelector, CalendarDay],
  templateUrl: './sprint-modal.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SprintModalComponent implements OnDestroy {
  isVisible = input<boolean>(false);
  sprintId = input<string | null>(null); // null = add mode, string = edit mode
  sprintSaved = output<Sprint>();
  modalClosed = output<void>();


  private sprintService = inject(SprintService);
  private layoutService = inject(LayoutService);
  private toastService = inject(ToastService);
  private destroy$ = new Subject<void>();

  // Calendar state
  currentDate = signal(new Date());
  selectedHolidays = signal<Set<string>>(new Set());

  // Loading state
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  
  // Single source of truth for sprint data
  sprint = signal<Sprint | null>(null);

  isEditing = computed(() => !!this.sprintId());
  modalTitle = computed(() => this.isEditing() ? 'Edit Sprint Settings' : 'Add New Sprint');
  submitButtonText = computed(() => this.isEditing() ? 'Save Changes' : 'Create Sprint');
  
  // Regular signal for form data (for child component input)
  sprintFormData = signal<SprintFormData | null>(null);

  // Helper method to update form data signal using raw data
  private updateFormData(sprintData: Sprint | null): void {
    if (sprintData == null) {
      this.sprintFormData.set({
        name: '',
        storyPointsPerDay: null,
        startDate: '',
        endDate: '',
        totalWorkDays: 0 // This will be overridden by the totalWorkDays() computed signal
      });
    } else {
      this.sprintFormData.set({
        name: sprintData.name,
        storyPointsPerDay: sprintData.storyPointsPerDay,
        startDate: sprintData.startDate,
        endDate: sprintData.endDate,
        totalWorkDays: 0 // This will be overridden by the totalWorkDays() computed signal
      });
    }
  }

  // Helper method to calculate work days without circular dependency
  private calculateTotalWorkDays(startDate: string, endDate: string): number {
    if (startDate == null || endDate == null || startDate === '' || endDate === '') return 0;
    return this.sprintService.calculateWorkDays(startDate, endDate, Array.from(this.selectedHolidays()));
  }

  // Helper method to filter holidays within date range
  private filterHolidaysInRange(startDate: string, endDate: string): void {
    if (startDate == null || endDate == null || startDate === '' || endDate === '') return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const filteredHolidays = new Set(
      Array.from(this.selectedHolidays()).filter(dateStr => {
        const holidayDate = new Date(dateStr);
        return holidayDate >= start && holidayDate <= end;
      })
    );
    
    this.selectedHolidays.set(filteredHolidays);
  }
  
  // Form validity computed from sprint signal
  isFormValid = computed(() => {
    const currentSprint = this.sprint();
    if (currentSprint?.name == null || 
        currentSprint?.storyPointsPerDay == null || 
        currentSprint?.startDate == null || 
        currentSprint?.endDate == null ||
        this.isSaving()) {
      return false;
    }
    
    // Check date range validation
    const startDate = new Date(currentSprint.startDate);
    const endDate = new Date(currentSprint.endDate);
    
    return endDate > startDate;
  });

  totalWorkDays = computed(() => {
    const currentSprint = this.sprint();
    if (currentSprint?.startDate == null || currentSprint?.endDate == null) return 0;
    return this.calculateTotalWorkDays(currentSprint.startDate, currentSprint.endDate);
  });

  // Computed signal for calendar days - updates when month or sprint data changes
  calendarDays = computed(() => {
    // Access sprint signal to trigger recalculation when dates change
    const currentSprint = this.sprint();
    
    // This computed will recalculate when:
    // 1. currentDate signal changes (month navigation)
    // 2. sprint signal changes (form date changes)
    return this.generateCalendarDays();
  });

  // Computed signal for sprint date range - only updates when sprint data changes
  sprintDateRange = computed(() => {
    const currentSprint = this.sprint();
    
    if (currentSprint?.startDate == null || currentSprint?.endDate == null) {
      return null;
    }
    
    return {
      startDate: currentSprint.startDate,
      endDate: currentSprint.endDate
    };
  });

  constructor() {
    // Watch for modal visibility and sprintId changes to load data
    effect(() => {
      if (this.isVisible()) {
        const sprintId = this.sprintId();
        
        untracked(() => {
          if (sprintId) {
            // Edit mode - load sprint data
            this.loadSprintData(sprintId);
          } else {
            // Add mode - reset sprint data
            this.sprint.set(null);
            this.selectedHolidays.set(new Set());
            this.currentDate.set(new Date());
            this.updateFormData(null);
          }
        });
      }
    });
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Load sprint data for edit mode
  private loadSprintData(sprintId: string): void {
    this.isLoading.set(true);
    
    const projectId = this.layoutService.getCurrentProjectId();
    if (projectId == null) {
      this.toastService.showError('No project selected');
      this.isLoading.set(false);
      return;
    }
    
    this.sprintService.getSprintById(sprintId, projectId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Set the sprint signal and update form data with raw API data
          this.sprint.set(response.data);
          this.selectedHolidays.set(new Set(response.data.specificHolidays));
          this.currentDate.set(new Date(response.data.startDate));
          this.updateFormData(response.data);
        } else {
          this.toastService.showError(response.message || 'Failed to load sprint');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        this.toastService.showError(error.message || 'Failed to load sprint');
        this.isLoading.set(false);
      }
    });
  }



  onSubmit(): void {
    // Prevent multiple submissions
    if (this.isSaving()) {
      return;
    }

    // Get current sprint data
    const currentSprint = this.sprint();
    
    // Basic validation
    if (currentSprint?.name && currentSprint?.storyPointsPerDay && currentSprint?.startDate && currentSprint?.endDate) {
      const projectId = this.layoutService.getCurrentProjectId();
      
      if (projectId == null) {
        this.toastService.showError('No project selected');
        return;
      }

      // Set saving state
      this.isSaving.set(true);

      const sprintData: Omit<Sprint, 'id'> = {
        name: currentSprint.name,
        storyPointsPerDay: currentSprint.storyPointsPerDay,
        startDate: currentSprint.startDate,
        endDate: currentSprint.endDate,
        specificHolidays: Array.from(this.selectedHolidays()),
        projectId: projectId
      };

      const sprintId = this.sprintId();
      if (sprintId) {
        // Update existing sprint
        const updatedSprint: Sprint = { ...sprintData, id: sprintId };
        this.sprintService.updateSprint(updatedSprint).pipe(takeUntil(this.destroy$)).subscribe({
          next: (response) => {
            this.isSaving.set(false);
            if (response.success && response.data) {
              this.toastService.showSuccess('Sprint updated successfully');
              this.sprintSaved.emit(response.data);
              this.onCancel();
            } else {
              this.toastService.showError(response.message || 'Failed to update sprint');
            }
          },
          error: (error) => {
            this.isSaving.set(false);
            this.toastService.showError(error.message || 'Failed to update sprint');
          }
        });
      } else {
        // Create new sprint
        this.sprintService.createSprint(sprintData).pipe(takeUntil(this.destroy$)).subscribe({
          next: (response) => {
            this.isSaving.set(false);
            if (response.success && response.data) {
              this.toastService.showSuccess('Sprint created successfully');
              this.sprintSaved.emit(response.data);
              this.onCancel();
            } else {
              this.toastService.showError(response.message || 'Failed to create sprint');
            }
          },
          error: (error) => {
            this.isSaving.set(false);
            this.toastService.showError(error.message || 'Failed to create sprint');
          }
        });
      }
    } else {
      console.warn('Form is invalid. Cannot submit.');
    }
  }

  onCancel(): void {
    this.modalClosed.emit();
  }

  // Calendar methods
  private formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private generateCalendarDays(): Date[] {
    const year = this.currentDate().getFullYear();
    const month = this.currentDate().getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = firstDay.getDay() - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }

  isHoliday(date: Date): boolean {
    const dateStr = this.formatDateToString(date);
    return this.selectedHolidays().has(dateStr);
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }


  isWithinSprintRange(date: Date): boolean {
    const range = this.sprintDateRange();
    
    if (range == null) return false;

    // Normalize all dates to midnight for accurate comparison
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedStart = new Date(range.startDate + 'T00:00:00');
    const normalizedEnd = new Date(range.endDate + 'T00:00:00');
    
    return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
  }

  toggleHoliday(date: Date): void {
    if (!this.isWithinSprintRange(date)) return;
    
    const dateStr = this.formatDateToString(date);
    const newHolidays = new Set(this.selectedHolidays());
    
    if (newHolidays.has(dateStr)) {
      newHolidays.delete(dateStr);
    } else {
      newHolidays.add(dateStr);
    }
    
    this.selectedHolidays.set(newHolidays);
  }


  // Event handlers for child components
  onHolidayToggled(dateStr: string): void {
    const newHolidays = new Set(this.selectedHolidays());
    if (newHolidays.has(dateStr)) {
      newHolidays.delete(dateStr);
    } else {
      newHolidays.add(dateStr);
    }
    this.selectedHolidays.set(newHolidays);
  }

  onRecurringHolidayToggle(dayOfWeek: number, selected: boolean): void {
    const range = this.sprintDateRange();
    if (range == null) return;

    const newHolidays = new Set(this.selectedHolidays());
    const current = new Date(range.startDate);

    while (current <= new Date(range.endDate)) {
      if (current.getDay() === dayOfWeek) {
        const dateStr = this.formatDateToString(current);
        if (selected) {
          // Add all instances of this day of week as holidays
          newHolidays.add(dateStr);
        } else {
          // Remove all instances of this day of week from holidays
          newHolidays.delete(dateStr);
        }
      }
      current.setDate(current.getDate() + 1);
    }
    
    this.selectedHolidays.set(newHolidays);
  }

  onMonthChanged(event: { direction: 'prev' | 'next' }): void {
    const current = this.currentDate();
    if (event.direction === 'prev') {
      this.currentDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
    } else {
      this.currentDate.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
    }
  }

  // Handle form value changes from SprintFormComponent
  onFormValueChanged(formData: { name: string, storyPointsPerDay: number | null, startDate: string, endDate: string }): void {
    const currentSprint = this.sprint();
    const projectId = this.layoutService.getCurrentProjectId();
    
    // Check if dates have changed to filter holidays
    const datesChanged = currentSprint && 
      (currentSprint.startDate !== formData.startDate || currentSprint.endDate !== formData.endDate);
    
    if (currentSprint && projectId) {
      // Update existing sprint with new form values
      const updatedSprint: Sprint = {
        ...currentSprint,
        name: formData.name,
        storyPointsPerDay: formData.storyPointsPerDay || 0,
        startDate: formData.startDate,
        endDate: formData.endDate
      };
      this.sprint.set(updatedSprint);
      
      // Filter holidays if dates changed
      if (datesChanged && formData.startDate && formData.endDate) {
        this.filterHolidaysInRange(formData.startDate, formData.endDate);
      }
    } else if (projectId) {
      // Create new sprint for add mode
      const newSprint: Sprint = {
        id: '', // Will be set by backend
        name: formData.name,
        storyPointsPerDay: formData.storyPointsPerDay || 0,
        startDate: formData.startDate,
        endDate: formData.endDate,
        specificHolidays: Array.from(this.selectedHolidays()),
        projectId: projectId
      };
      this.sprint.set(newSprint);
      
      // Filter holidays if dates are provided
      if (formData.startDate && formData.endDate) {
        this.filterHolidaysInRange(formData.startDate, formData.endDate);
      }
    }
  }
}
