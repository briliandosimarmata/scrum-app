import { Injectable, signal } from '@angular/core';
import { Project } from '../../shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  // Page title management
  private _pageTitle = signal<string>('Dashboard');
  
  // Project context management
  private _currentProjectId = signal<string | null>(null);
  private _currentProject = signal<Project | null>(null);
  
  // Sprint context management
  private _currentSprintId = signal<string | null>(null);

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
   * Gets the current project signal
   */
  get currentProject() {
    return this._currentProject.asReadonly();
  }

  /**
   * Gets the current sprint ID signal
   */
  get currentSprintId() {
    return this._currentSprintId.asReadonly();
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
   * Sets the current project
   * @param project - The project object
   */
  setCurrentProject(project: Project): void {
    this._currentProject.set(project);
    this._currentProjectId.set(project.id);
  }

  /**
   * Sets the current sprint ID
   * @param sprintId - The sprint ID
   */
  setCurrentSprintId(sprintId: string | null): void {
    this._currentSprintId.set(sprintId);
  }

  /**
   * Clears the current project
   */
  clearCurrentProject(): void {
    this._currentProject.set(null);
    this._currentProjectId.set(null);
  }

  /**
   * Clears the current sprint
   */
  clearCurrentSprint(): void {
    this._currentSprintId.set(null);
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

  /**
   * Gets the current project value
   */
  getCurrentProject(): Project | null {
    return this._currentProject();
  }

  /**
   * Gets the current sprint ID value
   */
  getCurrentSprintId(): string | null {
    return this._currentSprintId();
  }
}
