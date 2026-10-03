import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, Observable, of } from 'rxjs';
import { ApiResponse, SprintTimelineData, TaskPriority, TaskStatus } from '../../shared/interfaces';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TimelineService {
  private http = inject(HttpClient);

  /**
   * Get sprint timeline data
   * @param projectId - The project ID
   * @param sprintId - The sprint ID
   * @returns Observable of timeline data
   */
  getSprintTimeline(
    projectId: string,
    sprintId: string
  ): Observable<ApiResponse<SprintTimelineData>> {
    const url = `${environment.apiUrl}/private/v1/projects/${projectId}/sprints/${sprintId}/timeline`;
    return this.http.get<ApiResponse<SprintTimelineData>>(url);
  }
}
