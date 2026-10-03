import { Component, signal, computed, inject, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SprintService } from '../../../core/services/sprint.service';
import { ToastService } from '../../../core/services/toast.service';
import { AssigneeSprintListItem } from '../../../shared/interfaces';
import { UserMenuWidgetComponent } from '../../../shared/components/user-menu-widget/user-menu-widget';

@Component({
  selector: 'app-sprints',
  imports: [CommonModule, UserMenuWidgetComponent, DatePipe],
  templateUrl: './sprints.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SprintsComponent implements OnInit, OnDestroy {
  // State signals
  sprints = signal<AssigneeSprintListItem[]>([]);
  isLoading = signal(false);

  // Computed signals
  hasSprints = computed(() => this.sprints().length > 0);

  private destroy$ = new Subject<void>();
  private sprintService = inject(SprintService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadSprints();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSprints(): void {
    this.isLoading.set(true);

    this.sprintService.getAssigneeSprints()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.sprints.set(response.data.sprints);
          } else {
            this.toastService.showError(response.message);
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          this.toastService.showError(error.message || 'Failed to load sprints');
          this.isLoading.set(false);
        }
      });
  }

  onSprintSelected(sprint: AssigneeSprintListItem): void {
    // Navigate to sprint dashboard
    this.router.navigate(['/assignee-dashboard/sprints', sprint.id, 'dashboard']);
  }

  trackBySprintId(index: number, sprint: AssigneeSprintListItem): string {
    return sprint.id;
  }
}

