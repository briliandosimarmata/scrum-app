import {
  Component,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
  input,
  output,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DepartmentService } from '../../../../core/services/department.service';
import { AssigneeService } from '../../../../core/services/assignee.service';
import { LayoutService } from '../../../../core/services/layout.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Department, DepartmentWithMembers, Assignee, DepartmentRequest, DepartmentMemberRequest } from '../../../../shared/interfaces';
import { DraggableModal } from '../../../../shared/components/draggable-modal/draggable-modal';

@Component({
  selector: 'app-department-modal',
  imports: [CommonModule, ReactiveFormsModule, DraggableModal],
  templateUrl: './department-modal.html',
  styles: [`
    .member-list::-webkit-scrollbar { width: 6px; }
    .member-list::-webkit-scrollbar-track { background: #f1f5f9; }
    .member-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
    .member-list::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentModalComponent {
  private fb = inject(FormBuilder);
  private departmentService = inject(DepartmentService);
  private assigneeService = inject(AssigneeService);
  private layoutService = inject(LayoutService);
  private toastService = inject(ToastService);

  // Inputs
  isOpen = input.required<boolean>();
  departmentId = input<string | null>(null);

  // Outputs
  close = output<void>();
  saved = output<Department>();

  // State
  department = signal<Department | null>(null);
  isLoading = signal(false);
  isDataLoading = signal(false);
  availableAssignees = signal<Assignee[]>([]);
  originalMembers = signal<Assignee[]>([]);
  displayedMembers = signal<Assignee[]>([]);
  priorityAssignments = signal<{ [assigneeId: string]: boolean }>({});
  wasInitialized = false;

  // Form
  departmentForm: FormGroup;

  // Computed
  isEditMode = computed(() => this.departmentId() !== null);
  modalTitle = computed(() => this.isEditMode() ? 'Edit Department' : 'Add New Department');
  availableSearchTerm = signal('');
  membersSearchTerm = signal('');

  filteredAvailableAssignees = computed(() => {
    const searchTerm = this.availableSearchTerm().toLowerCase();
    return this.availableAssignees().filter(assignee =>
      assignee.name.toLowerCase().includes(searchTerm)
    );
  });

  filteredDepartmentMembers = computed(() => {
    const searchTerm = this.membersSearchTerm().toLowerCase();
    return this.displayedMembers().filter(assignee =>
      assignee.name.toLowerCase().includes(searchTerm)
    );
  });

  constructor() {
    this.departmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      code: [{ value: '', disabled: true }]
    });

    effect(() => {
      const isOpen = this.isOpen();
      const departmentId = this.departmentId();
      
      if (isOpen && !this.wasInitialized) {
        this.isDataLoading.set(true);
        if (departmentId) {
          // Edit mode
          this.loadDepartmentAndInitialize(departmentId);
        } else {
          // Add mode
          this.loadAssigneesAndInitialize();
        }
        this.wasInitialized = true;
      } else if (isOpen === false) {
        this.resetForm();
        this.wasInitialized = false;
        this.isDataLoading.set(false);
      }
    });
  }


  private loadDepartmentAndInitialize(departmentId: string): void {
    const projectId = this.layoutService.getCurrentProjectId();
    if (projectId == null) {
      this.toastService.showError('No project selected');
      this.isDataLoading.set(false);
      return;
    }
    
    this.departmentService.getDepartmentById(projectId, departmentId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.department.set(response.data);
          this.loadAssigneesAndInitialize();
        } else {
          this.toastService.showError(response.message || 'Failed to load department');
          this.loadAssigneesAndInitialize();
        }
      },
      error: (error) => {
        this.toastService.showError(error.message || 'Failed to load department');
        this.loadAssigneesAndInitialize();
      }
    });
  }

  private loadAssigneesAndInitialize(): void {
    const projectId = this.layoutService.getCurrentProjectId();
    if (projectId == null) {
      this.toastService.showError('No project selected');
      this.isDataLoading.set(false);
      return;
    }

    this.assigneeService.getAssigneesByProject(projectId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.availableAssignees.set(response.data.assignees);
          
          if (this.isEditMode() && this.department()) {
            this.loadDepartmentMembersAndSetupForm();
          } else {
            // Add mode: just initialize form
            this.initializeForm();
            this.isDataLoading.set(false);
          }
        } else {
          this.toastService.showError(response.message || 'Failed to load assignees');
          this.isDataLoading.set(false);
        }
      },
      error: (error) => {
        this.toastService.showError(error.message || 'Failed to load assignees');
        this.isDataLoading.set(false);
      }
    });
  }

  private loadDepartmentMembersAndSetupForm(): void {
    if (this.department() == null) {
      this.isDataLoading.set(false);
      return;
    }
    
    const projectId = this.layoutService.getCurrentProjectId();
    if (projectId == null) {
      this.isDataLoading.set(false);
      return;
    }
    
    this.departmentService.getAssigneesByDepartment(projectId, this.department()!.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.originalMembers.set(response.data.assignees);
          this.displayedMembers.set(response.data.assignees);
          this.setupPriorityAssignments(response.data.assignees, this.department()!.id);
          
          // Filter out department members from available assignees
          const memberIds = response.data.assignees.map(member => member.id);
          const filteredAvailable = this.availableAssignees().filter(assignee => 
            !memberIds.includes(assignee.id)
          );
          this.availableAssignees.set(filteredAvailable);
          
          this.initializeForm();
          this.isDataLoading.set(false);
        } else {
          this.toastService.showError(response.message || 'Failed to load department members');
          this.initializeForm();
          this.isDataLoading.set(false);
        }
      },
      error: (error) => {
        this.toastService.showError(error.message || 'Failed to load department members');
        this.initializeForm();
        this.isDataLoading.set(false);
      }
    });
  }

  private initializeForm(): void {
    const dept = this.department();
    if (dept) {
      // Edit mode
      this.departmentForm.patchValue({
        name: dept.name,
        code: dept.code
      });
    } else {
      // Add mode - code will be generated by backend
      this.departmentForm.patchValue({
        name: '',
        code: ''
      });
    }
  }

  private setupPriorityAssignments(members: Assignee[], departmentId: string): void {
    const priorities: { [assigneeId: string]: boolean } = {};

    members.forEach(member => {
      if (member.isPriority === true) {
        priorities[member.id] = true;
      }
    });
    
    this.priorityAssignments.set(priorities);
  }


  private resetForm(): void {
    this.departmentForm.reset();
    this.availableAssignees.set([]);
    this.originalMembers.set([]);
    this.displayedMembers.set([]);
    this.priorityAssignments.set({});
    this.availableSearchTerm.set('');
    this.membersSearchTerm.set('');
  }

  onAvailableSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.availableSearchTerm.set(target.value);
  }

  onMembersSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.membersSearchTerm.set(target.value);
  }

  moveToMembers(assignee: Assignee): void {
    const available = this.availableAssignees().filter(a => a.id !== assignee.id);
    this.availableAssignees.set(available);

    const members = [...this.displayedMembers(), assignee];
    this.displayedMembers.set(members);

    this.availableSearchTerm.set('');
  }

  moveToAvailable(assignee: Assignee): void {
    const members = this.displayedMembers().filter(a => a.id !== assignee.id);
    this.displayedMembers.set(members);

    const available = [...this.availableAssignees(), assignee];
    this.availableAssignees.set(available);

    const priorities = { ...this.priorityAssignments() };
    delete priorities[assignee.id];
    this.priorityAssignments.set(priorities);

    this.membersSearchTerm.set('');
  }

  togglePriority(assignee: Assignee): void {
    const priorities = { ...this.priorityAssignments() };
    priorities[assignee.id] = !priorities[assignee.id];
    this.priorityAssignments.set(priorities);
  }

  isPriorityMember(assignee: Assignee): boolean {
    return !!this.priorityAssignments()[assignee.id];
  }

  onCancel(): void {
    this.close.emit();
  }

  onSave(): void {
    if (this.departmentForm.valid) {
      this.isLoading.set(true);

      const formValue = this.departmentForm.value;
      const projectId = this.layoutService.getCurrentProjectId();

      if (projectId == null) {
        this.isLoading.set(false);
        return;
      }

      if (this.isEditMode() && this.department()) {
        // Edit mode: Compare original vs displayed
        const originalMembers = this.originalMembers();
        const displayedMembers = this.displayedMembers();
        const priorities = this.priorityAssignments();
        
        const removedMembers = originalMembers.filter(o => !displayedMembers.find(d => d.id === o.id));
        const savedMembers = displayedMembers;
        
        const members: DepartmentMemberRequest[] = [
          ...savedMembers.map(member => ({
            id: member.id,
            assigneeId: member.id, // Assuming member.id is assigneeId
            isPriority: !!priorities[member.id],
            markForDelete: false
          })),
          ...removedMembers.map(member => ({
            id: member.id,
            assigneeId: member.id, // Assuming member.id is assigneeId
            isPriority: false,
            markForDelete: true
          }))
        ];
        
        const updatedDepartment: DepartmentRequest = {
          id: this.department()!.id,
          name: formValue.name,
          projectId: projectId,
          members: members
        };

        this.departmentService.updateDepartment(updatedDepartment).subscribe({
          next: (response) => {
            if (response.success && response.data) {
              this.toastService.showSuccess('Department updated successfully');
              this.saved.emit(response.data);
              this.close.emit();
            } else {
              this.toastService.showError(response.message || 'Failed to update department');
            }
            this.isLoading.set(false);
          },
          error: (error) => {
            this.toastService.showError(error.message || 'Failed to update department');
            this.isLoading.set(false);
          }
        });
      } else {
        // Add mode
        const savedMembers = this.displayedMembers();
        const priorities = this.priorityAssignments();
        
        const members: DepartmentMemberRequest[] = savedMembers.map(member => ({
          assigneeId: member.id, // Assuming member.id is assigneeId
          isPriority: !!priorities[member.id],
          markForDelete: false
        }));
        
        const departmentData: DepartmentRequest = {
          name: formValue.name,
          projectId: projectId,
          members: members
        };

        this.departmentService.createDepartment(departmentData).subscribe({
          next: (response) => {
            if (response.success && response.data) {
              this.toastService.showSuccess('Department created successfully');
              this.saved.emit(response.data);
              this.close.emit();
            } else {
              this.toastService.showError(response.message || 'Failed to create department');
            }
            this.isLoading.set(false);
          },
          error: (error) => {
            this.toastService.showError(error.message || 'Failed to create department');
            this.isLoading.set(false);
          }
        });
      }
    }
  }


}