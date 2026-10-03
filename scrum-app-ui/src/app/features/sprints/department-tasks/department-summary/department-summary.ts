import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartmentTasksResponse } from '../../../../shared/interfaces';

@Component({
  selector: 'app-department-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './department-summary.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepartmentSummaryComponent {
  departmentData = input.required<DepartmentTasksResponse>();
}
