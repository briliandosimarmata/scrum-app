import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar-day',
  imports: [CommonModule],
  templateUrl: './calendar-day.html',
  styleUrls: ['./calendar-day.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarDay {
  // Inputs
  date = input.required<Date>();
  isHoliday = input<boolean>(false);
  isDisabled = input<boolean>(false);
  isToday = input<boolean>(false);
  
  // Outputs
  dayClicked = output<Date>();

  onDayClick(): void {
    if (!this.isDisabled()) {
      this.dayClicked.emit(this.date());
    }
  }

  getDayNumber(): number {
    return this.date().getDate();
  }
}
