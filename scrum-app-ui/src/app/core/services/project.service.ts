import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project, ProjectSummary, ApiResponse, ProjectListResponse } from '../../shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private http = inject(HttpClient);

  /**
   * Get all projects
   */
  getProjects(): Observable<ApiResponse<ProjectListResponse>> {
    return this.http.get<ApiResponse<ProjectListResponse>>(`${environment.apiUrl}/private/v1/projects`);
  }

  /**
   * Get a specific project by ID
   */
  getProjectById(projectId: string): Observable<ApiResponse<Project | null>> {
    return this.http.get<ApiResponse<Project>>(`${environment.apiUrl}/private/v1/projects/${projectId}`)
      .pipe(
        map(response => ({
          ...response,
          data: response.success ? response.data : null
        })),
        catchError(error => {
          console.error('Error fetching project:', error);
          return of({
            success: false,
            message: 'Failed to fetch project',
            data: null,
            error: {
              code: 'PROJECT_FETCH_ERROR',
              message: error.message || 'Unknown error occurred'
            }
          });
        })
      );
  }

  /**
   * Get a specific project by code
   */
  getProjectByCode(projectCode: string): Observable<ApiResponse<Project | null>> {
    return this.http.get<ApiResponse<Project>>(`${environment.apiUrl}/private/v1/projects/code/${projectCode}`)
      .pipe(
        map(response => ({
          ...response,
          data: response.success ? response.data : null
        })),
        catchError(error => {
          console.error('Error fetching project by code:', error);
          return of({
            success: false,
            message: 'Failed to fetch project by code',
            data: null,
            error: {
              code: 'PROJECT_FETCH_ERROR',
              message: error.message || 'Unknown error occurred'
            }
          });
        })
      );
  }

  /**
   * Create a new project
   */
  createProject(projectData: Omit<Project, 'id'>): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(`${environment.apiUrl}/private/v1/projects`, projectData)
      .pipe(
        catchError(error => {
          console.error('Error creating project:', error);
          return of({
            success: false,
            message: 'Failed to create project',
            data: null,
            error: {
              code: 'PROJECT_CREATE_ERROR',
              message: error.message || 'Unknown error occurred'
            }
          });
        })
      );
  }

  /**
   * Update an existing project
   */
  updateProject(projectData: Project): Observable<ApiResponse<Project>> {
    return this.http.put<ApiResponse<Project>>(`${environment.apiUrl}/private/v1/projects/${projectData.id}`, projectData)
      .pipe(
        catchError(error => {
          console.error('Error updating project:', error);
          return of({
            success: false,
            message: 'Failed to update project',
            data: null,
            error: {
              code: 'PROJECT_UPDATE_ERROR',
              message: error.message || 'Unknown error occurred'
            }
          });
        })
      );
  }

  /**
   * Delete a project
   */
  deleteProject(projectId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/private/v1/projects/${projectId}`)
      .pipe(
        map(response => ({
          ...response,
          data: null
        })),
        catchError(error => {
          console.error('Error deleting project:', error);
          return of({
            success: false,
            message: 'Failed to delete project',
            data: null,
            error: {
              code: 'PROJECT_DELETE_ERROR',
              message: error.message || 'Unknown error occurred'
            }
          });
        })
      );
  }

  /**
   * Get project summary statistics
   */
  getProjectSummary(projectId: string): Observable<ApiResponse<ProjectSummary>> {
    return this.http.get<ApiResponse<ProjectSummary>>(`${environment.apiUrl}/private/v1/projects/${projectId}/summary`)
      .pipe(
        catchError(error => {
          console.error('Error fetching project summary:', error);
          return of({
            success: false,
            message: 'Failed to fetch project summary',
            data: null,
            error: {
              code: 'PROJECT_SUMMARY_ERROR',
              message: error.message || 'Unknown error occurred'
            }
          });
        })
      );
  }

  /**
   * Generate a new project key
   */
  generateProjectKey(projectId: string): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(`${environment.apiUrl}/private/v1/projects/${projectId}/keys`, {})
      .pipe(
        catchError(error => {
          console.error('Error generating project key:', error);
          return of({
            success: false,
            message: 'Failed to generate project key',
            data: null,
            error: {
              code: 'PROJECT_KEY_GENERATION_ERROR',
              message: error.message || 'Unknown error occurred'
            }
          });
        })
      );
  }
}
