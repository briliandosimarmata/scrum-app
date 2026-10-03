import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-holiday-selector',
  imports: [CommonModule],
  templateUrl: './holiday-selector.html',
  styleUrls: ['./holiday-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HolidaySelector {
  // Inputs
  dateRange = input<{ startDate: string, endDate: string } | null>(null);
  selectedHolidays = input<Set<string>>(new Set());
  currentDate = input<Date>(new Date());
  
  // Outputs
  holidayToggled = output<string>();
  recurringHolidayToggled = output<{ dayOfWeek: number, selected: boolean }>();
  monthChanged = output<{ direction: 'prev' | 'next' }>();

  onHolidayToggle(dateStr: string): void {
    this.holidayToggled.emit(dateStr);
  }

  onRecurringHolidayToggle(dayOfWeek: number, selected: boolean): void {
    this.recurringHolidayToggled.emit({ dayOfWeek, selected });
  }

  onPreviousMonth(): void {
    this.monthChanged.emit({ direction: 'prev' });
  }

  onNextMonth(): void {
    this.monthChanged.emit({ direction: 'next' });
  }

  getMonthYear(): string {
    return this.currentDate().toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  }
}
