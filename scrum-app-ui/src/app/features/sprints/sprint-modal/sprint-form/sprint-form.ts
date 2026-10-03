import { Component, input, output, ChangeDetectionStrategy, OnInit, OnDestroy, inject, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

export interface SprintFormData {
  name: string;
  storyPointsPerDay: number | null;
  startDate: string;
  endDate: string;
  totalWorkDays: number;
}

// Custom validator for date range validation
function dateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const startDate = control.get('startDate')?.value;
  const endDate = control.get('endDate')?.value;
  
  if (!startDate || !endDate) {
    return null; // Let required validators handle empty values
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (end <= start) {
    return { dateRange: { message: 'End date must be later than start date' } };
  }
  
  return null;
}

@Component({
  selector: 'app-sprint-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sprint-form.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SprintForm implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();


  // Inputs
  formData = input<SprintFormData | null>(null);
  totalWorkDays = input<number>(0);
  
  // Outputs
  formValueChanged = output<{ name: string, storyPointsPerDay: number | null, startDate: string, endDate: string }>();

  // Internal form
  sprintForm: FormGroup;

  // Computed properties for validation
  isFormValid = computed(() => this.sprintForm.valid);
  hasDateRangeError = computed(() => this.sprintForm.hasError('dateRange'));
  dateRangeErrorMessage = computed(() => {
    const error = this.sprintForm.getError('dateRange');
    return error?.message || '';
  });

  constructor() {
    this.sprintForm = this.fb.group({
      name: ['', [Validators.required]],
      storyPointsPerDay: ['', [Validators.required, Validators.min(0.1)]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]]
    }, { validators: dateRangeValidator });

    // Watch for formData changes from parent and update form
    effect(() => {
      const data = this.formData();
      if (data) {
        this.sprintForm.patchValue({
          name: data.name,
          storyPointsPerDay: data.storyPointsPerDay,
          startDate: data.startDate,
          endDate: data.endDate
        });
      }
    });
  }

  ngOnInit(): void {
    // Subscribe to form changes and emit to parent
    this.sprintForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.formValueChanged.emit({
        name: value.name,
        storyPointsPerDay: value.storyPointsPerDay ? parseFloat(value.storyPointsPerDay) : null,
        startDate: value.startDate,
        endDate: value.endDate
      });
    });
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
