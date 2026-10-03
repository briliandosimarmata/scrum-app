import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UserRoleResponse, ApiResponse } from '../../shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  private http = inject(HttpClient);

  /**
   * Fetch user roles from API
   */
  getUserRoles(): Observable<UserRoleResponse | null> {
    return this.http.get<ApiResponse<UserRoleResponse>>(`${environment.apiUrl}/private/v1/user/roles`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error fetching user roles:', error);
        return of(null); // Return null on error
      })
    );
  }
}
