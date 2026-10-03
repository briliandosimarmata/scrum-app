import { Component, signal, computed, inject, ChangeDetectionStrategy, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AssigneeService } from '../../../core/services/assignee.service';
import { LayoutService } from '../../../core/services/layout.service';
import { ToastService } from '../../../core/services/toast.service';
import { Assignee } from '../../../shared/interfaces';

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
}

interface AssigneeRowState {
  assignee: Assignee;
  isEditing: boolean;
  isNew: boolean;
  isDirty: boolean;
  originalName: string;
}

@Component({
  selector: 'app-assignee',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assignee.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssigneeComponent implements OnInit, OnDestroy {
  private assigneeService = inject(AssigneeService);
  private layoutService = inject(LayoutService);
  private toastService = inject(ToastService);
  private destroy$ = new Subject<void>();

  // State
  assignees = signal<Assignee[]>([]);
  assigneeRows = signal<AssigneeRowState[]>([]);
  searchTerm = signal('');
  isLoading = signal(false);
  isSaving = signal(false);

  // Pagination
  pagination = signal<PaginationState>({
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 0,
    totalItems: 0
  });

  // Dropdown state
  showPageSizeDropdown = signal(false);

  // Computed values
  getAllAssignees(): Assignee[] {
    const existingAssignees = this.assignees();
    const newRows = this.assigneeRows().filter(row => row.isNew);
    const newAssignees = newRows.map(row => row.assignee);
    return [...newAssignees, ...existingAssignees];
  }

  filteredAssignees = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const allAssignees = this.getAllAssignees();
    
    if (term == null || term === '') return allAssignees;
    
    return allAssignees.filter(assignee => 
      assignee.name.toLowerCase().includes(term) || 
      assignee.code.toLowerCase().includes(term)
    );
  });

  paginatedAssignees = computed(() => {
    const filtered = this.filteredAssignees();
    const pagination = this.pagination();
    
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    
    return filtered.slice(startIndex, endIndex);
  });

  hasChanges = computed(() => {
    return this.assigneeRows().some(row => row.isDirty || row.isNew || row.isEditing);
  });

  hasValidNames = computed(() => {
    return this.assigneeRows().every(row => 
      !row.isEditing || this.isValidName(row.assignee.name)
    );
  });

  canSaveAll = computed(() => {
    return this.hasChanges() && this.hasValidNames() && !this.isSaving();
  });

  canDiscard = computed(() => {
    return this.hasChanges() && !this.isSaving();
  });


  ngOnInit(): void {
    this.loadAssignees();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.closest('.relative') == null) {
      this.showPageSizeDropdown.set(false);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAssignees(): void {
    const projectId = this.layoutService.getCurrentProjectId();
    if (projectId == null) {
      this.toastService.showError('No project selected');
      return;
    }

    this.isLoading.set(true);
    this.assigneeService.getAssigneesByProject(projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.assignees.set(response.data.assignees);
            this.updateAssigneeRows();
            this.updatePagination();
          } else {
            this.toastService.showError(response.message || 'Failed to load assignees');
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          this.toastService.showError('Failed to load assignees');
          this.isLoading.set(false);
        }
      });
  }

  updateAssigneeRows(): void {
    const rows: AssigneeRowState[] = this.assignees().map(assignee => ({
      assignee,
      isEditing: false,
      isNew: false,
      isDirty: false,
      originalName: assignee.name
    }));
    this.assigneeRows.set(rows);
  }

  updatePagination(): void {
    const filtered = this.filteredAssignees();
    const currentPagination = this.pagination();
    
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / currentPagination.itemsPerPage);
    
    // Ensure current page is valid
    let currentPage = currentPagination.currentPage;
    if (currentPage > totalPages && totalPages > 0) {
      currentPage = totalPages;
    }
    if (currentPage < 1) {
      currentPage = 1;
    }

    this.pagination.set({
      ...currentPagination,
      currentPage,
      totalPages,
      totalItems
    });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    this.pagination.update(p => ({ ...p, currentPage: 1 }));
    this.updatePagination();
  }

  togglePageSizeDropdown(): void {
    this.showPageSizeDropdown.update(show => !show);
  }

  onPageSizeChange(size: number): void {
    this.pagination.update(p => ({ 
      ...p, 
      itemsPerPage: size, 
      currentPage: 1 
    }));
    this.showPageSizeDropdown.set(false);
    this.updatePagination();
  }

  goToPage(page: number): void {
    const currentPagination = this.pagination();
    if (page >= 1 && page <= currentPagination.totalPages && page !== currentPagination.currentPage) {
      this.pagination.update(p => ({ ...p, currentPage: page }));
    }
  }

  addNewAssignee(): void {
    const projectId = this.layoutService.getCurrentProjectId();
    if (projectId == null) return;

    // Reset search
    this.searchTerm.set('');
    this.pagination.update(p => ({ ...p, currentPage: 1 }));

    const newAssignee: Assignee = {
      id: `temp-${Date.now()}`,
      code: '',
      name: '',
      projectId
    };

    const newRow: AssigneeRowState = {
      assignee: newAssignee,
      isEditing: true,
      isNew: true,
      isDirty: false,
      originalName: ''
    };

    this.assigneeRows.update(rows => [newRow, ...rows]);
    this.updatePagination();
  }

  editAssignee(assigneeId: string): void {
    this.assigneeRows.update(rows => 
      rows.map(row => 
        row.assignee.id === assigneeId 
          ? { ...row, isEditing: true }
          : row
      )
    );
  }

  onNameChange(assigneeId: string, newName: string): void {
    this.assigneeRows.update(rows => 
      rows.map(row => {
        if (row.assignee.id === assigneeId) {
          const isDirty = row.isNew ? newName !== '' : newName !== row.originalName;
          return {
            ...row,
            assignee: { ...row.assignee, name: newName },
            isDirty
          };
        }
        return row;
      })
    );
  }

  saveAll(): void {
    if (!this.canSaveAll()) return;

    this.isSaving.set(true);
    const projectId = this.layoutService.getCurrentProjectId();
    if (projectId == null) {
      this.toastService.showError('No project selected');
      this.isSaving.set(false);
      return;
    }

    const rowsToSave = this.assigneeRows().filter(row => row.isDirty || row.isNew);
    let completed = 0;
    let hasError = false;

    if (rowsToSave.length === 0) {
      this.isSaving.set(false);
      return;
    }

    rowsToSave.forEach(row => {
      if (row.isNew) {
        // Create new assignee
        const assigneeData = {
          name: row.assignee.name,
          projectId: row.assignee.projectId
        };

        this.assigneeService.createAssignee(assigneeData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              if (response.success) {
                completed++;
                if (completed === rowsToSave.length && !hasError) {
                  this.toastService.showSuccess('Assignees saved successfully');
                  this.loadAssignees(); // Refresh data
                  this.isSaving.set(false);
                }
              } else {
                hasError = true;
                this.toastService.showError(response.message || 'Failed to create assignee');
                this.isSaving.set(false);
              }
            },
            error: (error) => {
              hasError = true;
              this.toastService.showError(error.message || 'Failed to create assignee');
              this.isSaving.set(false);
            }
          });
      } else {
        // Update existing assignee
        this.assigneeService.updateAssignee(row.assignee.id, {
          name: row.assignee.name,
          projectId: row.assignee.projectId
        })
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              if (response.success) {
                completed++;
                if (completed === rowsToSave.length && !hasError) {
                  this.toastService.showSuccess('Assignees updated successfully');
                  this.loadAssignees(); // Refresh data
                  this.isSaving.set(false);
                }
              } else {
                hasError = true;
                this.toastService.showError(response.message || 'Failed to update assignee');
                this.isSaving.set(false);
              }
            },
            error: (error) => {
              hasError = true;
              this.toastService.showError(error.message || 'Failed to update assignee');
              this.isSaving.set(false);
            }
          });
      }
    });
  }

  discardChanges(): void {
    if (!this.canDiscard()) return;

    if (!confirm('Are you sure you want to discard all unsaved changes?')) return;

    // Remove new rows
    this.assigneeRows.update(rows => rows.filter(row => !row.isNew));
    
    // Reset dirty rows
    this.assigneeRows.update(rows => 
      rows.map(row => ({
        ...row,
        isEditing: false,
        isDirty: false,
        assignee: { ...row.assignee, name: row.originalName }
      }))
    );

    this.updatePagination();
  }

  deleteAssignee(assigneeId: string): void {
    const row = this.assigneeRows().find(r => r.assignee.id === assigneeId);
    if (row == null) return;

    const isNew = row.isNew;
    if (isNew || confirm('Are you sure you want to delete this assignee?')) {
      if (isNew) {
        // Remove from local state
        this.assigneeRows.update(rows => rows.filter(r => r.assignee.id !== assigneeId));
        this.updatePagination();
      } else {
        // Delete from backend
        const projectId = this.layoutService.getCurrentProjectId();
        if (projectId == null) {
          this.toastService.showError('No project selected');
          return;
        }

        this.assigneeService.deleteAssignee(assigneeId, projectId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.toastService.showSuccess('Assignee deleted successfully');
                this.loadAssignees(); // Refresh data
              } else {
                this.toastService.showError(response.message || 'Failed to delete assignee');
              }
            },
            error: (error) => {
              this.toastService.showError(error.message || 'Failed to delete assignee');
            }
          });
      }
    }
  }

  getRowState(assigneeId: string): AssigneeRowState | undefined {
    return this.assigneeRows().find(row => row.assignee.id === assigneeId);
  }

  generatePageNumbers(): (number | string)[] {
    const current = this.pagination().currentPage;
    const total = this.pagination().totalPages;
    const pages: (number | string)[] = [];
    
    if (total <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (current <= 4) {
        // Show first 5 pages, then ellipsis, then last page
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 3) {
        // Show first page, ellipsis, then last 5 pages
        pages.push('...');
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
        pages.push('...');
        pages.push(current - 1);
        pages.push(current);
        pages.push(current + 1);
        pages.push('...');
        pages.push(total);
      }
    }
    
    return pages;
  }

  trackByAssigneeId(index: number, assignee: Assignee): string {
    return assignee.id;
  }

  getEndItem(): number {
    const pagination = this.pagination();
    return Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems);
  }

  isValidName(name: string): boolean {
    return name.trim().length > 0;
  }
}