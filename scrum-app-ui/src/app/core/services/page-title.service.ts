import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  // Page title management
  private _pageTitle = signal<string>('Dashboard');
  
  // Project context management
  private _currentProjectId = signal<string | null>(null);

  /**
   * Gets the current page title signal
   */
  get pageTitle() {
    return this._pageTitle.asReadonly();
  }

  /**
   * Gets the current project ID signal
   */
  get currentProjectId() {
    return this._currentProjectId.asReadonly();
  }

  /**
   * Sets the page title
   * @param title - The new page title
   */
  setPageTitle(title: string): void {
    this._pageTitle.set(title);
  }

  /**
   * Sets the current project ID
   * @param projectId - The project ID
   */
  setCurrentProjectId(projectId: string): void {
    this._currentProjectId.set(projectId);
  }

  /**
   * Gets the current page title value
   */
  getCurrentTitle(): string {
    return this._pageTitle();
  }

  /**
   * Gets the current project ID value
   */
  getCurrentProjectId(): string | null {
    return this._currentProjectId();
  }
}
