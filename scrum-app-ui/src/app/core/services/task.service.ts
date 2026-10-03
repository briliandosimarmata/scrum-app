import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, TaskRequest, TaskResponse, TaskOrderUpdate } from '../../shared/interfaces';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getTasksBySprint(sprintId: string, projectId: string): Observable<ApiResponse<TaskResponse[]>> {
    return this.http.get<ApiResponse<TaskResponse[]>>(
      `${this.baseUrl}/private/v1/projects/${projectId}/tasks/sprint/${sprintId}`
    );
  }

  createTask(taskData: TaskRequest, projectId: string): Observable<ApiResponse<TaskResponse>> {
    return this.http.post<ApiResponse<TaskResponse>>(
      `${this.baseUrl}/private/v1/projects/${projectId}/tasks`,
      taskData
    );
  }

  updateTask(taskId: string, taskData: TaskRequest, projectId: string): Observable<ApiResponse<TaskResponse>> {
    return this.http.put<ApiResponse<TaskResponse>>(
      `${this.baseUrl}/private/v1/projects/${projectId}/tasks/${taskId}`,
      taskData
    );
  }

  deleteTask(taskId: string, projectId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.baseUrl}/private/v1/projects/${projectId}/tasks/${taskId}`
    );
  }

  /**
   * Update task order for drag and drop reordering
   */
  updateTaskOrder(orderData: TaskOrderUpdate[], projectId: string): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(
      `${this.baseUrl}/private/v1/projects/${projectId}/tasks/reorder`,
      { taskOrders: orderData }
    );
  }
}
