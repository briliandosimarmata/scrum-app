import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Department, DepartmentWithMembersResponse, DepartmentListWithMembersResponse, DepartmentTasksResponse, DepartmentRequest, AssigneeListResponse } from '../../shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Get all departments for a specific project with members
   */
  getDepartmentsByProject(projectId: string): Observable<ApiResponse<DepartmentListWithMembersResponse>> {
    return this.http.get<ApiResponse<DepartmentListWithMembersResponse>>(`${this.apiUrl}/private/v1/projects/${projectId}/departments`);
  }

  /**
   * Get single department by ID with members
   */
  getDepartmentWithMembersById(projectId: string, departmentId: string): Observable<ApiResponse<DepartmentWithMembersResponse>> {
    return this.http.get<ApiResponse<DepartmentWithMembersResponse>>(`${this.apiUrl}/private/v1/projects/${projectId}/departments/${departmentId}`);
  }

  /**
   * Get single department by ID (basic info only)
   */
  getDepartmentById(projectId: string, departmentId: string): Observable<ApiResponse<Department>> {
    return this.http.get<ApiResponse<Department>>(`${this.apiUrl}/private/v1/projects/${projectId}/departments/${departmentId}/basic`);
  }

  /**
   * Create a new department
   */
  createDepartment(departmentData: DepartmentRequest): Observable<ApiResponse<DepartmentWithMembersResponse>> {
    return this.http.post<ApiResponse<DepartmentWithMembersResponse>>(`${this.apiUrl}/private/v1/projects/${departmentData.projectId}/departments`, departmentData);
  }

  /**
   * Update an existing department
   */
  updateDepartment(departmentData: DepartmentRequest): Observable<ApiResponse<DepartmentWithMembersResponse>> {
    return this.http.put<ApiResponse<DepartmentWithMembersResponse>>(`${this.apiUrl}/private/v1/projects/${departmentData.projectId}/departments/${departmentData.id}`, departmentData);
  }

  /**
   * Delete a department
   */
  deleteDepartment(projectId: string, departmentId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/private/v1/projects/${projectId}/departments/${departmentId}`);
  }


  /**
   * Get assignees by department
   */
  getAssigneesByDepartment(projectId: string, departmentId: string): Observable<ApiResponse<AssigneeListResponse>> {
    return this.http.get<ApiResponse<AssigneeListResponse>>(`${this.apiUrl}/private/v1/projects/${projectId}/departments/${departmentId}/assignees`);
  }

  /**
   * Get department tasks
   */
  getDepartmentTasks(projectId: string, departmentId: string, sprintId: string): Observable<ApiResponse<DepartmentTasksResponse>> {
    return this.http.get<ApiResponse<DepartmentTasksResponse>>(`${this.apiUrl}/private/v1/projects/${projectId}/departments/${departmentId}/sprints/${sprintId}/tasks`);
  }

}