import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, ElementRef, EventEmitter, input, OnDestroy, Output, signal, ViewChild } from '@angular/core';
import { AssigneeTask, TaskStatus } from '../../../shared/interfaces';

@Component({
  selector: 'app-assignee-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssigneeTaskCardComponent implements OnDestroy {
  TaskStatus = TaskStatus;
  statusOptions = [
    { id: TaskStatus.TODO, name: 'To Do' },
    { id: TaskStatus.IN_PROGRESS, name: 'In Progress' },
    { id: TaskStatus.DONE, name: 'Done' }
  ];
  isOpen = signal(false);
  task = input.required<AssigneeTask>();
  @Output() statusChange = new EventEmitter<{task: AssigneeTask, status: TaskStatus}>();
  @ViewChild('dropdownPanel') dropdownPanel!: ElementRef;
  private _detachClick?: () => void;

  constructor() {
    effect(() => {
        if (this.isOpen()) {
          const onClick = (evt: MouseEvent) => {
            const panel = this.dropdownPanel?.nativeElement;
            const trigger = (evt.target as HTMLElement).closest('.dropdown-trigger');
            if (!panel?.contains(evt.target as Node) && !trigger) {
              this.isOpen.set(false);
            }
          };
          document.addEventListener('mousedown', onClick, true);
          this._detachClick = () => document.removeEventListener('mousedown', onClick, true);
        } else {
          this._detachClick?.();
          this._detachClick = undefined;
        }
      });
  }

  ngOnDestroy(): void {
    this._detachClick?.();
  }

  toggleDropdown() { this.isOpen.update(v => !v); }
  selectStatus(status: TaskStatus) {
    this.isOpen.set(false);
    if (this.task().status !== status) {
      this.statusChange.emit({task: this.task(), status});
    }
  }
  // Tailwind badge classes for status/priority
  statusBadgeClass(status: TaskStatus) {
    switch (status) {
      case TaskStatus.TODO: return 'bg-gray-200 text-gray-800';
      case TaskStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700';
      case TaskStatus.DONE: return 'bg-green-100 text-green-700';
      case TaskStatus.CLOSED: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
  selectedStatusBadgeClass(status: TaskStatus) {
    switch (status) {
      case TaskStatus.TODO: return 'bg-gray-100 text-gray-800';
      case TaskStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700';
      case TaskStatus.DONE: return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
  priorityBadgeClass(priority: string) {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-700';
      case 'MEDIUM': return 'bg-orange-100 text-orange-700';
      case 'LOW': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
  statusDisplayName(status: TaskStatus) {
    switch (status) {
      case TaskStatus.TODO: return 'To Do';
      case TaskStatus.IN_PROGRESS: return 'In Progress';
      case TaskStatus.DONE: return 'Done';
      case TaskStatus.CLOSED: return 'Closed';
      default: return '';
    }
  }
}
