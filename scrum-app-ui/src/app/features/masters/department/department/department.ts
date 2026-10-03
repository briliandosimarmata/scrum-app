import {
  Component,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartmentService } from '../../../../core/services/department.service';
import { LayoutService } from '../../../../core/services/layout.service';
import { ToastService } from '../../../../core/services/toast.service';
import { DepartmentWithMembersResponse } from '../../../../shared/interfaces';
import { DepartmentModalComponent } from '../department-modal/department-modal';

@Component({
  selector: 'app-department',
  imports: [CommonModule, DepartmentModalComponent],
  templateUrl: './department.html',
  styles: [`
    .member-list::-webkit-scrollbar { width: 6px; }
    .member-list::-webkit-scrollbar-track { background: #f1f5f9; }
    .member-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
    .member-list::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentComponent implements OnInit {
  private departmentService = inject(DepartmentService);
  private layoutService = inject(LayoutService);
  private toastService = inject(ToastService);

  // State
  departments = signal<DepartmentWithMembersResponse[]>([]);
  isLoading = signal(false);
  isModalOpen = signal(false);
  selectedDepartmentId = signal<string | null>(null);

  // Computed
  departmentsWithMembers = computed(() => this.departments());

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    const projectId = this.layoutService.getCurrentProjectId();
    if (projectId == null) {
      this.toastService.showError('No project selected');
      return;
    }

    this.isLoading.set(true);

    // Load departments with members in single API call
    this.departmentService.getDepartmentsByProject(projectId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.departments.set(response.data.departments);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.isLoading.set(false);
      }
    });
  }


  onAddDepartment(): void {
    this.selectedDepartmentId.set(null);
    this.isModalOpen.set(true);
  }

  onEditDepartment(department: DepartmentWithMembersResponse): void {
    this.selectedDepartmentId.set(department.id);
    this.isModalOpen.set(true);
  }

  onDeleteDepartment(department: DepartmentWithMembersResponse): void {
    if (confirm(`Are you sure you want to delete the "${department.name}" department?`)) {
      const projectId = this.layoutService.getCurrentProjectId();
      if (projectId == null) {
        this.toastService.showError('No project selected');
        return;
      }
      
      this.departmentService.deleteDepartment(projectId, department.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.showSuccess('Department deleted successfully');
            this.loadData(); // Reload data
          } else {
            this.toastService.showError(response.message || 'Failed to delete department');
          }
        },
        error: (error) => {
          this.toastService.showError(error.message || 'Failed to delete department');
        }
      });
    }
  }

  onModalClose(): void {
    this.isModalOpen.set(false);
    this.selectedDepartmentId.set(null);
  }

  onDepartmentSaved(): void {
    this.loadData(); // Reload data
  }

  getAvatarColor(index: number): string {
    const colors = [
      'bg-blue-200 text-blue-700',
      'bg-green-200 text-green-700',
      'bg-purple-200 text-purple-700',
      'bg-red-200 text-red-700',
      'bg-indigo-200 text-indigo-700',
      'bg-yellow-200 text-yellow-700'
    ];
    return colors[index % colors.length];
  }


  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }


}