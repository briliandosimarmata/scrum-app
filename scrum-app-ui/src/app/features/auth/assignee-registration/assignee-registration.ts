import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AssigneeRegistrationRequest } from '../../../shared/interfaces';

@Component({
  selector: 'app-assignee-registration',
  imports: [CommonModule, RouterModule],
  templateUrl: './assignee-registration.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssigneeRegistrationComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  // Form state
  email = signal('');
  password = signal('');
  assigneeCode = signal('');
  projectKey = signal('');

  isSubmitting = signal(false);
  success = signal(false);
  error = signal<string | null>(null);

  onInputUppercaseAssignee(e: Event) {
    const v = (e.target as HTMLInputElement).value.toUpperCase();
    this.assigneeCode.set(v);
  }

  submit(): void {
    this.error.set(null);
    this.success.set(false);

    const payload: AssigneeRegistrationRequest = {
      email: this.email().trim(),
      password: this.password(),
      assigneeCode: this.assigneeCode().trim(),
      projectKey: this.projectKey().trim(),
    };

    if (!payload.email || !payload.password || !payload.assigneeCode || !payload.projectKey) {
      this.error.set('All fields are required');
      return;
    }

    this.isSubmitting.set(true);
    this.auth.registerAssignee(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.success.set(true);
          // redirect to login after short delay
          setTimeout(() => this.router.navigate(['/auth/login']), 1500);
        } else {
          this.error.set(res.message || 'Registration failed');
        }
        this.isSubmitting.set(false);
      },
      error: (e) => {
        this.error.set(e?.error?.message || e?.message || 'Registration failed');
        this.isSubmitting.set(false);
      }
    });
  }
}


