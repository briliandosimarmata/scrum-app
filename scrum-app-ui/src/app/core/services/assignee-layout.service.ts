import { Injectable, signal } from '@angular/core';
import { AssigneeSprintListItem } from '../../shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AssigneeLayoutService {
  // Sprint context management for assignee
  private _currentSprintId = signal<string | null>(null);
  private _currentSprint = signal<AssigneeSprintListItem | null>(null);

  /**
   * Gets the current sprint ID signal (readonly)
   */
  get currentSprintId() {
    return this._currentSprintId.asReadonly();
  }

  /**
   * Gets the current sprint signal (readonly)
   */
  get currentSprint() {
    return this._currentSprint.asReadonly();
  }

  /**
   * Sets the current sprint and its ID
   * @param sprint - The sprint object
   */
  setCurrentSprint(sprint: AssigneeSprintListItem): void {
    this._currentSprint.set(sprint);
    this._currentSprintId.set(sprint.id);
  }

  /**
   * Sets the current sprint ID only
   * @param sprintId - The sprint ID
   */
  setCurrentSprintId(sprintId: string): void {
    this._currentSprintId.set(sprintId);
  }

  /**
   * Clears the current sprint context
   */
  clearCurrentSprint(): void {
    this._currentSprint.set(null);
    this._currentSprintId.set(null);
  }

  /**
   * Gets the current sprint ID value (not signal)
   */
  getCurrentSprintId(): string | null {
    return this._currentSprintId();
  }

  /**
   * Gets the current sprint value (not signal)
   */
  getCurrentSprint(): AssigneeSprintListItem | null {
    return this._currentSprint();
  }
}

