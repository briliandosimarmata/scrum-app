import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssigneeTasksResponse } from '../../../../shared/interfaces';

@Component({
  selector: 'app-assignee-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assignee-summary.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssigneeSummaryComponent {
  assigneeData = input.required<AssigneeTasksResponse>();
}