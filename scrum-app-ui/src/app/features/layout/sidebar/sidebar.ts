import {
  Component,
  signal,
  inject,
  ChangeDetectionStrategy,
  OnInit,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { LayoutService } from '../../../core/services/layout.service';
import { SprintService } from '../../../core/services/sprint.service';
import { SprintModalComponent } from '../../sprints/sprint-modal/sprint-modal';
import { Project, Sprint, SprintListItem } from '../../../shared/interfaces';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string[];
  isParent?: boolean;
  children?: MenuItem[];
}


@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, SprintModalComponent],
  templateUrl: './sidebar.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit {
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private layoutService = inject(LayoutService);
  private sprintService = inject(SprintService);

  // State
  activeParentMenu = signal<string>('');

  // Navigation state
  mastersSubmenuOpen = signal(false);
  sprintSubmenuOpen = signal(false);

  // Sprint modal state
  isSprintModalOpen = signal(false);
  selectedSprintId = signal<string | null>(null);
  isAddMode = signal(false);

  // Sprint dropdown state
  isSprintDropdownOpen = signal(false);
  sprintSearchTerm = signal('');
  sprintList = signal<SprintListItem[]>([]);

  // Computed properties
  filteredSprints = computed(() => {
    const searchTerm = this.sprintSearchTerm().toLowerCase();
    return this.sprintList().filter(sprint => 
      sprint.name.toLowerCase().includes(searchTerm)
    );
  });

  selectedSprintName = computed(() => {
    const selectedId = this.selectedSprintId();
    if (selectedId == null) return 'Select a sprint';
    const sprint = this.sprintList().find(s => s.id === selectedId);
    return sprint?.name || 'Select a sprint';
  });

  hasSprints = computed(() => this.sprintList().length > 0);

  // Computed signal for modal sprint ID based on add/edit mode
  modalSprintId = computed(() => {
    return this.isAddMode() ? null : this.selectedSprintId();
  });

  // CSS class variables for active states
  readonly ACTIVE_PARENT_CLASSES = 'bg-blue-600 text-white hover:bg-blue-600 hover:text-white';
  readonly ACTIVE_CHILD_CLASSES = 'bg-blue-100 text-blue-700 font-semibold hover:bg-blue-100 hover:text-blue-700 hover:font-semibold';

  // Menu structure following router hierarchy
  readonly MENU_STRUCTURE: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'fa-solid fa-table-columns',
      path: ['dashboard']
    },
    {
      id: 'masters',
      label: 'Masters',
      icon: 'fa-solid fa-database',
      path: ['masters'],
      isParent: true,
      children: [
        {
          id: 'assignee',
          label: 'Assignee',
          icon: '',
          path: ['masters', 'assignee']
        },
        {
          id: 'department',
          label: 'Department',
          icon: '',
          path: ['masters', 'department']
        }
      ]
    },
    {
      id: 'sprints',
      label: 'Sprint Menu',
      icon: 'fa-solid fa-person-running',
      path: ['sprints'],
      isParent: true,
      children: [
        {
          id: 'backlog',
          label: 'Backlog',
          icon: '',
          path: ['sprints', 'backlog']
        },
        {
          id: 'department-tasks',
          label: 'Department Tasks',
          icon: '',
          path: ['sprints', 'department-tasks']
        },
        {
          id: 'assignee-tasks',
          label: 'Assignee Tasks',
          icon: '',
          path: ['sprints', 'assignee-tasks']
        },
        {
          id: 'timeline',
          label: 'Timeline',
          icon: '',
          path: ['sprints', 'timeline']
        },
        {
          id: 'sprint-settings',
          label: 'Sprint Setting',
          icon: '',
          path: ['sprints', 'sprint-settings']
        }
      ]
    }
  ];

  ngOnInit(): void {
    this.initializeActiveMenu();
    this.loadSprints();
  }

  /**
   * Initializes the active parent menu based on current route
   */
  private initializeActiveMenu(): void {
    const urlTree = this.router.parseUrl(this.router.url);
    const segments = urlTree.root.children['primary']?.segments;
    
    if (segments && segments.length > 0) {
      const lastSegment = segments[segments.length - 1].path;
      this.setActiveParentMenu(lastSegment);
    } else {
      // Default to Dashboard if no segments found
      this.layoutService.setPageTitle('Dashboard');
    }
  }

  /**
   * Gets the current project from LayoutService
   */
  get currentProject() {
    return this.layoutService.currentProject;
  }

  /**
   * Toggles the masters submenu visibility
   */
  toggleMastersSubmenu(): void {
    this.mastersSubmenuOpen.update((open) => !open);
  }

  /**
   * Toggles the sprint submenu visibility
   */
  toggleSprintSubmenu(): void {
    this.sprintSubmenuOpen.update((open) => !open);
  }

  /**
   * Navigates back to the projects list
   */
  navigateToProjects(): void {
    this.router.navigate(['/projects']);
  }

  /**
   * Sets the active parent menu based on the clicked menu item
   * @param menuId - The ID of the menu item that was clicked
   */
  setActiveParentMenu(menuId: string): void {
    // Find the parent menu for the clicked item
    for (const menu of this.MENU_STRUCTURE) {
      // If it's a direct parent menu (dashboard, masters, sprints)
      if (menu.id === menuId) {
        this.activeParentMenu.set(menu.id);
        this.layoutService.setPageTitle(menu.label);
        return;
      }

      // If it's a child of a parent menu
      if (menu.isParent && menu.children) {
        for (const child of menu.children) {
          if (child.id === menuId) {
            this.activeParentMenu.set(menu.id);
            this.layoutService.setPageTitle(child.label);
            return;
          }
        }
      }
    }
  }

  /**
   * Builds the full router path for a menu item
   * @param menuItem - The menu item to build path for
   * @returns Array with project ID and menu path
   */
  buildMenuPath(menuItem: MenuItem): string[] {
    return ['/projects', this.layoutService.getCurrentProjectId() || '', ...menuItem.path];
  }

  /**
   * Gets all menu items as an array for iteration
   * @returns Array of menu items
   */
  getMenuItems(): MenuItem[] {
    return this.MENU_STRUCTURE;
  }

  // Sprint-related methods
  private loadSprints(): void {
    const projectId = this.layoutService.getCurrentProjectId();
    if (projectId == null) return;

    this.sprintService.getSprintList(projectId).subscribe({
      next: (response) => {
        if (response.data && response.data.sprints) {
          this.sprintList.set(response.data.sprints);
          // Auto-select first sprint if none selected
          if (this.selectedSprintId() == null && response.data.sprints.length > 0) {
            const firstSprintId = response.data.sprints[0].id;
            this.selectedSprintId.set(firstSprintId);
            this.layoutService.setCurrentSprintId(firstSprintId);
          }
        }
      },
      error: (error) => {
        console.error('Error loading sprints:', error);
      }
    });
  }

  onAddSprint(): void {
    this.isAddMode.set(true);
    this.isSprintModalOpen.set(true);
  }

  onEditSprint(): void {
    const selectedId = this.selectedSprintId();
    if (selectedId == null) {
      alert('Please select a sprint to edit.');
      return;
    }

    this.isAddMode.set(false);
    this.isSprintModalOpen.set(true);
  }

  onSprintSaved(sprint: Sprint): void {
    this.isSprintModalOpen.set(false);

    // Reload sprint list to reflect changes
    this.loadSprints();
  }

  onSprintModalClosed(): void {
    this.isSprintModalOpen.set(false);
  }

  // Sprint dropdown methods
  toggleSprintDropdown(): void {
    this.isSprintDropdownOpen.update(open => !open);
  }

  onSprintSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.sprintSearchTerm.set(target.value);
  }

  selectSprint(sprintId: string): void {
    this.selectedSprintId.set(sprintId);
    this.layoutService.setCurrentSprintId(sprintId);
    this.isSprintDropdownOpen.set(false);
    this.sprintSearchTerm.set('');
  }

  onSprintDropdownClickOutside(): void {
    this.isSprintDropdownOpen.set(false);
  }
}
