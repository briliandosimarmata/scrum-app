import { Component, signal, computed, inject, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Project } from '../../../shared/interfaces';
import { ProjectCardComponent } from '../project-card/project-card';
import { ProjectModalComponent } from '../project-modal/project-modal';
import { UserMenuWidgetComponent } from '../../../shared/components/user-menu-widget/user-menu-widget';

@Component({
  selector: 'app-project-list',
  imports: [CommonModule, RouterModule, ProjectCardComponent, ProjectModalComponent, UserMenuWidgetComponent],
  templateUrl: './project-list.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectListComponent implements OnInit, OnDestroy {
  // State signals
  projects = signal<Project[]>([]);
  isLoading = signal(false);
  isModalVisible = signal(false);
  editingProject = signal<Project | null>(null);

  // Computed signals
  hasProjects = computed(() => this.projects().length > 0);
  currentUser = computed(() => this.authService.currentUser());

  private destroy$ = new Subject<void>();
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.loadProjects();
    this.checkForErrors();
  }

  private checkForErrors(): void {
    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        this.toastService.showError(params['error']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjects(): void {
    this.isLoading.set(true);

    this.projectService.getProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.projects.set(response.data.projects);
          } else {
            this.toastService.showError(response.message);
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          this.toastService.showError(error.message || 'Failed to load projects');
          this.isLoading.set(false);
        }
      });
  }

  onCreateProject(): void {
    this.editingProject.set(null);
    this.isModalVisible.set(true);
  }

  onEditProject(project: Project): void {
    this.editingProject.set(project);
    this.isModalVisible.set(true);
  }

  onDeleteProject(project: Project): void {
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      this.projectService.deleteProject(project.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.toastService.showSuccess('Project deleted successfully');
              this.loadProjects(); // Reload projects
            } else {
              this.toastService.showError(response.message);
            }
          },
          error: (error) => {
            this.toastService.showError(error.message || 'Failed to delete project');
          }
        });
    }
  }

  onSaveProject(projectData: Project): void {
    if (this.editingProject()) {
      // Update existing project
      this.projectService.updateProject(projectData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.toastService.showSuccess('Project updated successfully');
              this.isModalVisible.set(false);
              this.editingProject.set(null);
              this.loadProjects(); // Reload projects
            } else {
              this.toastService.showError(response.message);
            }
          },
          error: (error) => {
            this.toastService.showError(error.message || 'Failed to update project');
          }
        });
    } else {
      // Create new project
      this.projectService.createProject(projectData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.toastService.showSuccess('Project created successfully');
              this.isModalVisible.set(false);
              this.editingProject.set(null);
              this.loadProjects(); // Reload projects
            } else {
              this.toastService.showError(response.message);
            }
          },
          error: (error) => {
            this.toastService.showError(error.message || 'Failed to create project');
          }
        });
    }
  }

  onGenerateProjectKey(project: Project): void {
    this.editingProject.set(project);
  }

  onCancelModal(): void {
    this.isModalVisible.set(false);
    this.editingProject.set(null);
  }


  trackByProjectId(index: number, project: Project): string {
    return project.id;
  }

}
