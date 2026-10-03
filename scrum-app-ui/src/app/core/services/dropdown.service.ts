import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { DropdownOption, AssigneeMetadata, TaskPriority, TaskStatus, EnumUtils, ApiResponse } from '../../shared/interfaces';
import { TaskService } from './task.service';
import { DepartmentService } from './department.service';
import { AssigneeService } from './assignee.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DropdownService {
  private http = inject(HttpClient);
  private taskService = inject(TaskService);
  private departmentService = inject(DepartmentService);
  private assigneeService = inject(AssigneeService);
  
  private apiUrl = environment.apiUrl;

  /**
   * Get tasks by sprint ID for dependency dropdown
   * @param sprintId - The sprint ID
   * @param projectId - The project ID
   * @returns Observable of dropdown options
   */
  getTasksBySprintId(sprintId: string, projectId: string): Observable<ApiResponse<DropdownOption[]>> {
    return this.http.get<ApiResponse<DropdownOption[]>>(
      `${this.apiUrl}/private/v1/projects/${projectId}/dropdowns/tasks?sprintId=${sprintId}`
    );
  }

  /**
   * Get departments by project ID
   * @param projectId - The project ID
   * @returns Observable of dropdown options
   */
  getDepartmentsByProject(projectId: string): Observable<ApiResponse<DropdownOption[]>> {
    return this.http.get<ApiResponse<DropdownOption[]>>(`${this.apiUrl}/private/v1/projects/${projectId}/dropdowns/departments`);
  }

  /**
   * Get assignees by project ID
   * @param projectId - The project ID
   * @returns Observable of dropdown options
   */
  getAssigneesByProject(projectId: string): Observable<ApiResponse<DropdownOption<AssigneeMetadata>[]>> {
    return this.http.get<ApiResponse<DropdownOption<AssigneeMetadata>[]>>(`${this.apiUrl}/private/v1/projects/${projectId}/dropdowns/assignees`);
  }

  /**
   * Get priorities dropdown options
   * @returns Observable of dropdown options
   */
  getPriorityOptions(): Observable<ApiResponse<DropdownOption[]>> {
    const priorities: DropdownOption[] = [
      { id: TaskPriority.HIGH, name: 'High', displayName: 'High', badgeClass: EnumUtils.getTaskPriorityBadgeClass(TaskPriority.HIGH) },
      { id: TaskPriority.MEDIUM, name: 'Medium', displayName: 'Medium', badgeClass: EnumUtils.getTaskPriorityBadgeClass(TaskPriority.MEDIUM) },
      { id: TaskPriority.LOW, name: 'Low', displayName: 'Low', badgeClass: EnumUtils.getTaskPriorityBadgeClass(TaskPriority.LOW) }
    ];

    return of({
      success: true, error: null,
      message: 'Success',
      data: priorities
    });
  }

  /**
   * Get status dropdown options
   * @param excludeClosed - Whether to exclude closed status
   * @returns Observable of dropdown options
   */
  getStatusOptions(excludeClosed: boolean = false): Observable<ApiResponse<DropdownOption[]>> {
    const statuses: DropdownOption[] = [
      { id: TaskStatus.TODO, name: 'To Do', displayName: 'To Do', badgeClass: EnumUtils.getTaskStatusBadgeClass(TaskStatus.TODO) },
      { id: TaskStatus.IN_PROGRESS, name: 'In Progress', displayName: 'In Progress', badgeClass: EnumUtils.getTaskStatusBadgeClass(TaskStatus.IN_PROGRESS) },
      { id: TaskStatus.DONE, name: 'Done', displayName: 'Done', badgeClass: EnumUtils.getTaskStatusBadgeClass(TaskStatus.DONE) },
      { id: TaskStatus.CLOSED, name: 'Closed', displayName: 'Closed', badgeClass: EnumUtils.getTaskStatusBadgeClass(TaskStatus.CLOSED) }
    ];

    const filteredStatuses = excludeClosed 
      ? statuses.filter(s => s.id !== TaskStatus.CLOSED)
      : statuses;

    return of({
      success: true, error: null,
      message: 'Success',
      data: filteredStatuses
    });
  }
}
