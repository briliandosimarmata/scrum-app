import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Sprint, SprintListResponse, AssigneeSprintListResponse, AssigneeSprintListItem, AssigneeOverviewResponse, AssigneeTask, TaskStatus, AssigneeTasksPage, AssigneeTimelineResponse } from '../../shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class SprintService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Get sprint list for dropdown (only id and name)
   */
  getSprintList(projectId: string): Observable<ApiResponse<SprintListResponse>> {
    return this.http.get<ApiResponse<SprintListResponse>>(`${this.apiUrl}/private/v1/projects/${projectId}/sprints`);
  }

  /**
   * Get full sprint data by ID
   */
  getSprintById(sprintId: string, projectId: string): Observable<ApiResponse<Sprint>> {
    return this.http.get<ApiResponse<Sprint>>(`${this.apiUrl}/private/v1/projects/${projectId}/sprints/${sprintId}`);
  }

  /**
   * Create a new sprint
   */
  createSprint(sprintData: Omit<Sprint, 'id'>): Observable<ApiResponse<Sprint>> {
    return this.http.post<ApiResponse<Sprint>>(`${this.apiUrl}/private/v1/projects/${sprintData.projectId}/sprints`, sprintData);
  }

  /**
   * Update an existing sprint
   */
  updateSprint(sprintData: Sprint): Observable<ApiResponse<Sprint>> {
    return this.http.put<ApiResponse<Sprint>>(`${this.apiUrl}/private/v1/projects/${sprintData.projectId}/sprints/${sprintData.id}`, sprintData);
  }

  /**
   * Delete a sprint
   */
  deleteSprint(sprintId: string, projectId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/private/v1/projects/${projectId}/sprints/${sprintId}`);
  }

  /**
   * Calculate work days between start and end date, excluding weekends and holidays
   * This is a client-side utility function
   */
  calculateWorkDays(startDate: string, endDate: string, specificHolidays: string[]): number {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) return 0;
    
    let workDays = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      const dateStr = current.toISOString().split('T')[0];
      
      // Skip holidays
      if (!specificHolidays.includes(dateStr)) {
        workDays++;
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return workDays;
  }

  /**
   * Get sprint list for assignee
   * API: /api/private/v1/assignee/sprints
   */
  getAssigneeSprints(): Observable<ApiResponse<AssigneeSprintListResponse>> {
    return this.http.get<ApiResponse<AssigneeSprintListResponse>>(`${this.apiUrl}/private/v1/assignee/sprints`);
  }

  /**
   * Get a specific sprint by ID for assignee
   * API: /api/private/v1/assignee/sprints/{sprintId}
   */
  getAssigneeSprintById(sprintId: string): Observable<ApiResponse<AssigneeSprintListItem>> {
    return this.http.get<ApiResponse<AssigneeSprintListItem>>(`${this.apiUrl}/private/v1/assignee/sprints/${sprintId}`);
  }

  /**
   * Get sprint overview data for assignee dashboard
   * API: /api/private/v1/assignee/sprints/{sprintId}/overview
   */
  getAssigneeSprintOverview(sprintId: string): Observable<ApiResponse<AssigneeOverviewResponse>> {
    return this.http.get<ApiResponse<AssigneeOverviewResponse>>(`${this.apiUrl}/private/v1/assignee/sprints/${sprintId}/overview`);
  }

  /**
   * Get paginated tasks for assignee
   * API: /api/private/v1/assignee/sprints/{sprintId}/tasks?limit=5&cursor=...
   */
  getAssigneeTasks(sprintId: string, limit = 5, cursor?: string): Observable<ApiResponse<AssigneeTasksPage>> {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (cursor) params.set('cursor', cursor);
    return this.http.get<ApiResponse<AssigneeTasksPage>>(
      `${this.apiUrl}/private/v1/assignee/sprints/${sprintId}/tasks?${params.toString()}`
    );
  }

  /**
   * Update task status for assignee
   * API: /api/private/v1/assignee/sprints/{sprintId}/tasks/{taskId}/status (PATCH)
   */
  updateAssigneeTaskStatus(sprintId: string, taskId: string, status: TaskStatus): Observable<ApiResponse<null>> {
    return this.http.patch<ApiResponse<null>>(
      `${this.apiUrl}/private/v1/assignee/sprints/${sprintId}/tasks/${taskId}/status`,
      { status }
    );
  }

  /**
   * Get assignee timeline data for sprint
   * API: /api/private/v1/assignee/sprints/{sprintId}/timeline
   */
  getAssigneeTimeline(sprintId: string): Observable<ApiResponse<AssigneeTimelineResponse>> {
    return this.http.get<ApiResponse<AssigneeTimelineResponse>>(
      `${this.apiUrl}/private/v1/assignee/sprints/${sprintId}/timeline`
    );
  }
}