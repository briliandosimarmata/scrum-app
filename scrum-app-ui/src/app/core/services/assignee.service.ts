import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Assignee, ApiResponse, AssigneeListResponse, AssigneeTasksResponse } from '../../shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AssigneeService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Get all assignees for a specific project
   */
  getAssigneesByProject(projectId: string): Observable<ApiResponse<AssigneeListResponse>> {
    return this.http.get<ApiResponse<AssigneeListResponse>>(`${this.apiUrl}/private/v1/projects/${projectId}/assignees`);
  }


  /**
   * Create a new assignee
   */
  createAssignee(assigneeData: { name: string; projectId: string }): Observable<ApiResponse<Assignee>> {
    return this.http.post<ApiResponse<Assignee>>(`${this.apiUrl}/private/v1/projects/${assigneeData.projectId}/assignees`, {
      name: assigneeData.name
    });
  }

  /**
   * Update an existing assignee
   */
  updateAssignee(assigneeId: string, assigneeData: { name: string; projectId: string }): Observable<ApiResponse<Assignee>> {
    return this.http.put<ApiResponse<Assignee>>(`${this.apiUrl}/private/v1/projects/${assigneeData.projectId}/assignees/${assigneeId}`, {
      name: assigneeData.name
    });
  }

  /**
   * Delete an assignee by its ID
   */
  deleteAssignee(assigneeId: string, projectId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/private/v1/projects/${projectId}/assignees/${assigneeId}`);
  }

  /**
   * Get assignee tasks with summary data
   */
  getAssigneeTasks(projectId: string, assigneeId: string, sprintId: string): Observable<ApiResponse<AssigneeTasksResponse>> {
    return this.http.get<ApiResponse<AssigneeTasksResponse>>(`${this.apiUrl}/private/v1/projects/${projectId}/assignees/${assigneeId}/sprints/${sprintId}/tasks`);
  }
}