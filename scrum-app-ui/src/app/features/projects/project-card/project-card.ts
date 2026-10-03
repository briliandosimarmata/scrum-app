import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Project } from '../../../shared/interfaces';

@Component({
  selector: 'app-project-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './project-card.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectCardComponent {
  // Input signals
  project = input.required<Project>();

  // Output events
  editProject = output<Project>();
  deleteProject = output<Project>();

  onEditProject(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.editProject.emit(this.project());
  }

  onDeleteProject(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.deleteProject.emit(this.project());
  }

  trackByProjectId(index: number, project: Project): string {
    return project.id;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    
    // Prevent infinite recursion by checking if we're already using a fallback
    if (img.src.includes('placeholder.com') || img.src.includes('data:image')) {
      // If fallback also fails, show a simple div with background color
      img.style.display = 'none';
      const fallbackDiv = document.createElement('div');
      fallbackDiv.className = 'h-32 sm:h-28 lg:h-32 xl:h-32 w-full bg-gray-200 flex items-center justify-center flex-shrink-0';
      fallbackDiv.innerHTML = '<span class="text-gray-500 text-sm">No Image</span>';
      img.parentNode?.insertBefore(fallbackDiv, img);
      return;
    }
    
    // First fallback attempt - use a simple data URL
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
  }
}
