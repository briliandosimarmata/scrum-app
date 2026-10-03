import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartmentTasksResponse, TaskPriority, EnumUtils } from '../../../../shared/interfaces';

@Component({
  selector: 'app-department-tasks-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './department-tasks-table.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepartmentTasksTableComponent {
  departmentData = input.required<DepartmentTasksResponse>();

  getPriorityBadgeClass(priority: TaskPriority): string {
    return EnumUtils.getTaskPriorityBadgeClass(priority);
  }

  getPriorityDisplayName(priority: TaskPriority): string {
    return EnumUtils.getTaskPriorityDisplayName(priority);
  }
}
