import { Component, input, output, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { AssigneeTasksResponse, TaskPriority, TaskStatus, TaskOrderUpdate, EnumUtils } from '../../../../shared/interfaces';
import { TaskService } from '../../../../core/services/task.service';
import { ToastService } from '../../../../core/services/toast.service';
import { LayoutService } from '../../../../core/services/layout.service';

@Component({
  selector: 'app-assignee-tasks-table',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './assignee-tasks-table.html',
  styleUrls: ['./assignee-tasks-table.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssigneeTasksTableComponent {
  assigneeData = input.required<AssigneeTasksResponse>();
  
  // Event emitter to notify parent component to reload data
  tasksReloaded = output<void>();
  
  // Loading state for save operation
  isSaving = signal(false);
  
  private taskService = inject(TaskService);
  private toastService = inject(ToastService);
  private layoutService = inject(LayoutService);

  getPriorityBadgeClass(priority: TaskPriority): string {
    return EnumUtils.getTaskPriorityBadgeClass(priority);
  }

  getPriorityDisplayName(priority: TaskPriority): string {
    return EnumUtils.getTaskPriorityDisplayName(priority);
  }

  getStatusBadgeClass(status: TaskStatus): string {
    return EnumUtils.getTaskStatusBadgeClass(status);
  }

  getStatusDisplayName(status: TaskStatus): string {
    return EnumUtils.getTaskStatusDisplayName(status);
  }

  getDependencyDisplay(dependency: string | null): string {
    return dependency || 'None';
  }

  onTaskDrop(event: CdkDragDrop<any[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return; // No change in position
    }

    const tasks = [...this.assigneeData().tasks];
    
    // Remove the dragged item from its original position
    const draggedTask = tasks.splice(event.previousIndex, 1)[0];
    
    // Insert the dragged item at the new position
    tasks.splice(event.currentIndex, 0, draggedTask);

    // Update order numbers (1-based) for all tasks
    const orderData: TaskOrderUpdate[] = tasks.map((task, index) => ({
      taskId: task.taskId,
      taskOrder: index + 1
    }));

    // Save the new order
    this.saveTaskOrder(orderData);
  }

  private saveTaskOrder(orderData: TaskOrderUpdate[]): void {
    this.isSaving.set(true);
    
    const projectId = this.layoutService.getCurrentProjectId();
    if (projectId == null) {
      this.toastService.showError('No project selected. Cannot update task order.');
      this.isSaving.set(false);
      return;
    }
    
    this.taskService.updateTaskOrder(orderData, projectId).subscribe({
      next: () => {
        this.toastService.showSuccess('Task order updated successfully');
        this.isSaving.set(false);
        // Emit event to reload tasks data
        this.tasksReloaded.emit();
      },
      error: (error) => {
        this.toastService.showError('Failed to update task order');
        this.isSaving.set(false);
        // Emit event to reload tasks data
        this.tasksReloaded.emit();
      }
    });
  }
}