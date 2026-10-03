import { Component, input, output, signal, computed, inject, ChangeDetectionStrategy, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Project } from '../../../shared/interfaces';
import { DraggableModal } from '../../../shared/components/draggable-modal/draggable-modal';
import { ProjectService } from '../../../core/services/project.service';

@Component({
  selector: 'app-project-modal',
  imports: [CommonModule, ReactiveFormsModule, DraggableModal],
  templateUrl: './project-modal.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectModalComponent implements OnInit, OnDestroy {
  // Input signals
  isVisible = input<boolean>(false);
  project = input<Project | null>(null);

  // Output events
  saveProject = output<Project>();
  cancelModal = output<void>();
  generateProjectKey = output<Project>();

  // Form and state
  projectForm: FormGroup;

  // Computed signals
  isEditing = computed(() => !!this.project());
  modalTitle = computed(() => this.isEditing() ? 'Edit Project' : 'Create a New Project');
  submitButtonText = computed(() => this.isEditing() ? 'Update Project' : 'Create Project');

  // Character counters
  nameCharCount = signal(0);
  codeCharCount = signal(0);

  // Project key state
  isGeneratingKey = signal(false);
  copySuccess = signal(false);

  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);

  constructor() {
        this.projectForm = this.fb.group({
          name: ['', [Validators.required, Validators.maxLength(20)]],
          code: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.pattern(/^[A-Za-z0-9]{4}$/)]],
          description: ['', [Validators.required]],
          thumbnailUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/i)]]
        });

    // Watch for project input changes
    effect(() => {
      this.populateForm();
    });
  }

  ngOnInit(): void {
    // Set up character counters
    this.projectForm.get('name')?.valueChanges.subscribe(value => {
      this.nameCharCount.set(value?.length || 0);
    });

    this.projectForm.get('code')?.valueChanges.subscribe(value => {
      this.codeCharCount.set(value?.length || 0);
      // Auto-uppercase
      if (value) {
        this.projectForm.get('code')?.setValue(value.toUpperCase(), { emitEvent: false });
      }
    });
  }

  private populateForm(): void {
    const project = this.project();
    if (project) {
      this.projectForm.patchValue({
        name: project.name,
        code: project.code,
        description: project.description,
        thumbnailUrl: project.thumbnailUrl
      });
    } else {
      this.projectForm.reset();
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      const formValue = this.projectForm.value;
      const projectData: Project = {
        id: this.project()?.id || Date.now().toString(),
        name: formValue.name,
        code: formValue.code,
        description: formValue.description,
        thumbnailUrl: formValue.thumbnailUrl,
        createdAt: this.project()?.createdAt || new Date(),
        updatedAt: new Date()
      };
      
      this.saveProject.emit(projectData);
    }
  }

  onCancel(): void {
    this.cancelModal.emit();
  }

  onGenerateProjectKey(): void {
    const project = this.project();
    if (!project?.id) return;

    this.isGeneratingKey.set(true);
    
    // Call the project service to generate a new key
    this.projectService.generateProjectKey(project.id).subscribe({
      next: (response) => {
        this.isGeneratingKey.set(false);
        if (response.success && response.data) {
          // Update the project with the new key
          const updatedProject = { ...project, projectKey: response.data.projectKey };
          // Emit the updated project to refresh the parent component
          this.generateProjectKey.emit(updatedProject);
        }
      },
      error: (error) => {
        this.isGeneratingKey.set(false);
        console.error('Failed to generate project key:', error);
      }
    });
  }

  onCopyProjectKey(): void {
    const project = this.project();
    if (!project?.projectKey) return;

    // Copy to clipboard
    navigator.clipboard.writeText(project.projectKey).then(() => {
      this.copySuccess.set(true);
      // Reset success state after 2 seconds
      setTimeout(() => {
        this.copySuccess.set(false);
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy project key:', err);
    });
  }
  
}
