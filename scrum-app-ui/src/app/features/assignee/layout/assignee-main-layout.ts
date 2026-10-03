import { Component, ChangeDetectionStrategy, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { AssigneeLayoutService } from '../../../core/services/assignee-layout.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserMenuWidgetComponent } from '../../../shared/components/user-menu-widget/user-menu-widget';

@Component({
  selector: 'app-assignee-main-layout',
  imports: [CommonModule, RouterOutlet, RouterModule, UserMenuWidgetComponent],
  templateUrl: './assignee-main-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssigneeMainLayoutComponent implements OnInit {
  private assigneeLayoutService = inject(AssigneeLayoutService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Mobile sidebar state
  isSidebarOpen = signal(false);

  // Get current sprint from service
  currentSprint = this.assigneeLayoutService.currentSprint;

  // Sprint display name
  sprintDisplayName = computed(() => {
    const sprint = this.currentSprint();
    if (!sprint) return 'Loading...';
    return `${sprint.name} - ${sprint.project.name}`;
  });

  // Page title based on current child route
  pageTitle = signal<string>('Dashboard');

  private computePageTitle(url: string): string {
    // Expected URLs: /assignee-dashboard/sprints/:sprintId/dashboard | my-tasks | timeline
    if (url.includes('/my-tasks')) return 'My Tasks';
    if (url.includes('/timeline')) return 'Timeline';
    return 'Dashboard';
  }

  ngOnInit(): void {
    // Initialize sidebar state based on screen size
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    // Initialize and listen to route changes for title
    this.pageTitle.set(this.computePageTitle(this.router.url));
    this.router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd) {
        this.pageTitle.set(this.computePageTitle(ev.urlAfterRedirects || ev.url));
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(open => !open);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  handleResize(): void {
    if (window.innerWidth >= 768) {
      // Desktop: always show sidebar
      this.isSidebarOpen.set(true);
    } else {
      // Mobile: hide sidebar by default
      this.isSidebarOpen.set(false);
    }
  }

  navigateToSprints(): void {
    this.router.navigate(['/assignee-dashboard/sprints']);
  }
}

