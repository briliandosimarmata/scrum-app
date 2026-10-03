import { Component, input, output, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskResponse, TaskStatus, TaskPriority, DropdownOption, DropdownConfig, EnumUtils } from '../../../../shared/interfaces';
import { DropdownComponent } from '../../../../shared/components/dropdown/dropdown';

@Component({
  selector: '[app-backlog-table-row]',
  imports: [CommonModule, DropdownComponent],
  templateUrl: './backlog-table-row.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BacklogTableRowComponent {
  // Inputs
  task = input.required<TaskResponse>();
  isLoading = input<boolean>(false);
  
  // Dropdown data inputs from parent component
  allDepartmentOptions = input.required<DropdownOption[]>();
  allAssigneeOptions = input.required<DropdownOption[]>();
  allDependencyOptions = input.required<DropdownOption[]>();
  allPriorityOptions = input.required<DropdownOption[]>();
  allStatusOptions = input.required<DropdownOption[]>();

  // Outputs
  taskUpdated = output<TaskResponse>();
  taskDeleted = output<string>();
  taskClosed = output<string>();

  // Inline editing state
  editingField = signal<string | null>(null);
  editValues = signal<{ description: string; storyPoints: number }>({ description: '', storyPoints: 0 });

  // Row-level computed dropdown options (isolated per row)
  departmentOptions = computed(() => this.allDepartmentOptions());
  
  assigneeOptions = computed(() => {
    const departmentId = this.task().departmentId;
    if (departmentId == null) return [];
    
    // Filter assignees by THIS ROW's selected department
    return this.allAssigneeOptions().filter(assignee => 
      assignee.metadata?.departmentId === departmentId
    );
  });

  dependencyOptions = computed(() => {
    const currentTaskId = this.task().id;
    // Filter out current task from dependencies
    const otherTasks = this.allDependencyOptions().filter(dep => dep.id !== currentTaskId);
    
    // Add "None" option at the top
    const noneOption: DropdownOption = { 
      id: null, 
      name: 'None', 
      displayName: 'None' 
    };
    
    return [noneOption, ...otherTasks];
  });

  priorityOptions = computed(() => this.allPriorityOptions());
  statusOptions = computed(() => this.allStatusOptions());

  // Computed properties for dependent dropdown behavior
  isAssigneeEnabled = computed(() => {
    // Check if THIS ROW has a department selected
    return !!this.task().departmentId;
  });


  // Helper methods
  getPriorityBadgeClass(priority: TaskPriority): string {
    return EnumUtils.getTaskPriorityBadgeClass(priority);
  }

  getStatusBadgeClass(status: TaskStatus): string {
    return EnumUtils.getTaskStatusBadgeClass(status);
  }

  getStatusDisplayName(status: TaskStatus): string {
    return EnumUtils.getTaskStatusDisplayName(status);
  }

  getPriorityDisplayName(priority: TaskPriority): string {
    return EnumUtils.getTaskPriorityDisplayName(priority);
  }

  getDepartmentDisplayName(departmentId: string | null | undefined): string {
    if (departmentId == null) return 'Select Department';
    const department = this.departmentOptions().find(d => d.id === departmentId);
    return department?.name || 'Select Department';
  }

  getAssigneeDisplayName(assigneeId: string | null | undefined): string {
    if (assigneeId == null) return 'Select Assignee';
    const assignee = this.assigneeOptions().find(a => a.id === assigneeId);
    return assignee?.name || 'Select Assignee';
  }

  getDependencyDisplayName(dependencyId: string | null | undefined): string {
    if (dependencyId == null) return 'None';
    const dependency = this.dependencyOptions().find(d => d.id === dependencyId);
    return dependency?.displayName || dependency?.name || 'None';
  }

  isClosed(): boolean {
    return this.task().status === TaskStatus.CLOSED;
  }

  onCloseTask(): void {
    this.taskClosed.emit(this.task().id);
  }

  onDeleteTask(): void {
    this.taskDeleted.emit(this.task().id);
  }

  // Inline editing methods
  startEditing(field: string): void {
    if (this.isClosed()) return;
    
    this.editingField.set(field);
    const task = this.task();
    
    this.editValues.set({
      description: task.description,
      storyPoints: task.storyPoints
    });
  }

  saveEdit(): void {
    const task = this.task();
    const editValues = this.editValues();
    
    // Basic validation
    if (editValues.description.trim() === '') {
      return;
    }
    if (editValues.storyPoints <= 0) {
      return;
    }
    
    const updatedTask: TaskResponse = {
      ...task,
      description: editValues.description,
      storyPoints: editValues.storyPoints
    };
    
    this.taskUpdated.emit(updatedTask);
    this.editingField.set(null);
  }

  cancelEdit(): void {
    this.editingField.set(null);
  }

  onInputChange(field: string, value: string | number): void {
    const currentValues = this.editValues();
    this.editValues.set({
      ...currentValues,
      [field]: value
    });
  }

  // Dropdown configuration methods
  getPriorityConfig(): DropdownConfig {
    return {
      type: 'priority',
      isSearchable: false,
      placeholder: 'Select Priority'
    };
  }

  getStatusConfig(): DropdownConfig {
    return {
      type: 'status',
      isSearchable: false,
      placeholder: 'Select Status'
    };
  }

  getDepartmentConfig(): DropdownConfig {
    return {
      type: 'department',
      isSearchable: true,
      placeholder: 'Select Department'
    };
  }

  getAssigneeConfig(): DropdownConfig {
    return {
      type: 'assignee',
      isSearchable: true,
      placeholder: this.isAssigneeEnabled() ? 'Select Assignee' : 'Select Department First',
      isDisabled: !this.isAssigneeEnabled()
    };
  }

  getDependencyConfig(): DropdownConfig {
    return {
      type: 'dependency',
      isSearchable: true,
      placeholder: 'Select Dependency'
    };
  }

  // Dropdown event handlers
  onPrioritySelected(priority: string | number | null): void {
    const task = this.task();
    const updatedTask: TaskResponse = {
      ...task,
      priority: priority as TaskPriority
    };
    this.taskUpdated.emit(updatedTask);
  }

  onStatusSelected(status: string | number | null): void {
    const task = this.task();
    const updatedTask: TaskResponse = {
      ...task,
      status: status as TaskStatus
    };
    this.taskUpdated.emit(updatedTask);
  }

  onDepartmentSelected(departmentId: string | number | null): void {
    const task = this.task();
    const updatedTask: TaskResponse = {
      ...task,
      departmentId: departmentId as string,
      assigneeId: undefined // Reset assignee when department changes
    };
    this.taskUpdated.emit(updatedTask);
  }

  onAssigneeSelected(assigneeId: string | number | null): void {
    const task = this.task();
    const updatedTask: TaskResponse = {
      ...task,
      assigneeId: assigneeId as string
    };
    this.taskUpdated.emit(updatedTask);
  }

  onDependencySelected(dependencyId: string | number | null): void {
    const task = this.task();
    const updatedTask: TaskResponse = {
      ...task,
      dependencyTaskId: dependencyId as string
    };
    this.taskUpdated.emit(updatedTask);
  }
}
