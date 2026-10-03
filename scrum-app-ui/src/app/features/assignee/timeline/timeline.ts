import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { AssigneeLayoutService } from '../../../core/services/assignee-layout.service';
import { SprintService } from '../../../core/services/sprint.service';
import { ToastService } from '../../../core/services/toast.service';
import { AssigneeTimelineResponse } from '../../../shared/interfaces';

@Component({
  selector: 'app-assignee-timeline',
  imports: [CommonModule],
  templateUrl: './timeline.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssigneeTimelineComponent implements OnInit {
  private sprintService = inject(SprintService);
  private assigneeLayout = inject(AssigneeLayoutService);
  private toast = inject(ToastService);

  data = signal<AssigneeTimelineResponse | null>(null);
  isLoading = signal<boolean>(true);
  currentMonthIndex = signal<number>(0);

  months = computed<string[]>(() => {
    const d = this.data();
    if (!d) return [];
    // Build month list between start and end from tasks actually present
    const set = new Set<string>();
    for (const t of d.tasks) {
      const m = new Date(t.startDate + 'T00:00:00').toLocaleDateString('default', { month: 'long', year: 'numeric' });
      set.add(m);
    }
    return Array.from(set);
  });

  visibleTasks = computed(() => {
    const d = this.data();
    const months = this.months();
    if (!d || months.length === 0) return [];
    const currentMonth = months[this.currentMonthIndex()];
    return d.tasks.filter(t => new Date(t.startDate + 'T00:00:00').toLocaleDateString('default', { month: 'long', year: 'numeric' }) === currentMonth);
  });

  ngOnInit(): void {
    const sprintId = this.assigneeLayout.getCurrentSprintId();
    if (!sprintId) {
      this.toast.showError('No sprint selected');
      this.isLoading.set(false);
      return;
    }
    this.sprintService.getAssigneeTimeline(sprintId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.data.set(res.data);
          this.currentMonthIndex.set(0);
        } else {
          this.toast.showError(res.message || 'Failed to load timeline');
        }
        this.isLoading.set(false);
      },
      error: (e) => {
        this.toast.showError(e?.message || 'Failed to load timeline');
        this.isLoading.set(false);
      }
    });
  }

  navigateMonth(direction: number): void {
    const months = this.months();
    const idx = this.currentMonthIndex() + direction;
    if (idx >= 0 && idx < months.length) this.currentMonthIndex.set(idx);
  }

  formatDateRange(start: string, end: string): string {
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end + 'T00:00:00');
    const dp = new DatePipe('en-US');
    return `${dp.transform(s, 'MMM d')} - ${dp.transform(e, 'MMM d')}`;
  }

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'TODO': return 'bg-gray-100 text-gray-700';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
      case 'DONE': return 'bg-green-100 text-green-700';
      case 'CLOSED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  statusBorderClass(status: string): string {
    switch (status) {
      case 'TODO': return 'border-gray-300';
      case 'IN_PROGRESS': return 'border-blue-500';
      case 'DONE': return 'border-green-500';
      case 'CLOSED': return 'border-red-500';
      default: return 'border-gray-300';
    }
  }

  statusDisplayName(status: string): string {
    switch (status) {
      case 'TODO': return 'To Do';
      case 'IN_PROGRESS': return 'In Progress';
      case 'DONE': return 'Done';
      case 'CLOSED': return 'Closed';
      default: return 'Unknown';
    }
  }
}


