import { Component, signal, computed, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../core/services/project.service';
import { LayoutService } from '../../core/services/layout.service';
import { ToastService } from '../../core/services/toast.service';
import { Project, ProjectSummary } from '../../shared/interfaces';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  private projectService = inject(ProjectService);
  private layoutService = inject(LayoutService);
  private toastService = inject(ToastService);

  // State
  currentProject = signal<Project | null>(null);
  projectSummary = signal<ProjectSummary | null>(null);
  isLoading = signal(false);
  isSummaryLoading = signal(false);

  // Computed values
  totalSprints = computed(() => this.projectSummary()?.totalSprints || 0);
  totalTasks = computed(() => this.projectSummary()?.totalTasks || 0);
  totalDepartments = computed(() => this.projectSummary()?.totalDepartments || 0);
  totalAssignees = computed(() => this.projectSummary()?.totalAssignees || 0);

  ngOnInit(): void {
    this.loadProject();
  }

  loadProject(): void {
    const projectId = this.layoutService.getCurrentProjectId();
    if (projectId == null) {
      this.toastService.showError('No project selected');
      return;
    }

    this.isLoading.set(true);
    this.isSummaryLoading.set(true);
    
    // Load project data
    this.projectService.getProjectById(projectId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.currentProject.set(response.data);
          this.loadProjectSummary(projectId);
        } else {
          this.toastService.showError(response.message || 'Failed to load project');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        this.toastService.showError(error.message || 'Failed to load project');
        this.isLoading.set(false);
      }
    });
  }

  loadProjectSummary(projectId: string): void {
    this.projectService.getProjectSummary(projectId).subscribe({
      next: (response) => {
        if (response.success) {
          this.projectSummary.set(response.data);
        }
        this.isSummaryLoading.set(false);
      },
      error: () => {
        this.isSummaryLoading.set(false);
      }
    });
  }

}
