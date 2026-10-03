import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SprintService } from '../../../core/services/sprint.service';
import { AssigneeLayoutService } from '../../../core/services/assignee-layout.service';
import { ToastService } from '../../../core/services/toast.service';
import { AssigneeOverviewResponse } from '../../../shared/interfaces';

@Component({
  selector: 'app-assignee-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssigneeDashboardPageComponent implements OnInit, OnDestroy {
  private sprintService = inject(SprintService);
  private assigneeLayoutService = inject(AssigneeLayoutService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // State
  overviewData = signal<AssigneeOverviewResponse | null>(null);
  isLoading = signal(true);
  private destroy$ = new Subject<void>();

  // Computed properties
  hasData = computed(() => this.overviewData() !== null);
  sprint = computed(() => this.overviewData()?.sprint);
  project = computed(() => this.overviewData()?.project);
  taskSummary = computed(() => this.overviewData()?.taskSummary);
  departments = computed(() => this.overviewData()?.departments || []);

  ngOnInit(): void {
    this.loadOverviewData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOverviewData(): void {
    this.isLoading.set(true);
    
    // Get sprintId from route params
    const sprintId = this.assigneeLayoutService.getCurrentSprintId();
    
    if (!sprintId) {
      this.toastService.showError('Sprint ID is required');
      this.router.navigate(['/assignee-dashboard/sprints']);
      return;
    }

    this.sprintService.getAssigneeSprintOverview(sprintId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.overviewData.set(response.data);
          } else {
            this.toastService.showError(response.message || 'Failed to load dashboard data');
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.toastService.showError(err.message || 'Error loading dashboard data');
          this.isLoading.set(false);
        }
      });
  }

  formatDateRange(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const datePipe = new DatePipe('en-US');
    return `${datePipe.transform(start, 'MMM d')} - ${datePipe.transform(end, 'MMM d')}`;
  }

  navigateToMyTasks(): void {
    const sprintId = this.route.snapshot.paramMap.get('sprintId');
    this.router.navigate(['/assignee-dashboard/sprints', sprintId, 'my-tasks']);
  }

  navigateToTimeline(): void {
    const sprintId = this.route.snapshot.paramMap.get('sprintId');
    this.router.navigate(['/assignee-dashboard/sprints', sprintId, 'timeline']);
  }

  navigateToSprintList(): void {
    this.router.navigate(['/assignee-dashboard/sprints']);
  }
}

