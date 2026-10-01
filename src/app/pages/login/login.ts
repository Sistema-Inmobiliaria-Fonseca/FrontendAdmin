import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { ApiError } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.scss',
  standalone: false,
})
export class LoginComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly hidePassword = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly fieldErrors = signal<Record<string, string>>({});
  readonly submitting = signal(false);
  readonly currentYear = new Date().getFullYear();

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [true],
  });

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      void this.router.navigate(['/dashboard']);
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((hidden) => !hidden);
  }

  showPasswordError(field: 'email' | 'password'): boolean {
    const control = this.loginForm.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    this.fieldErrors.set({});

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    this.authService
      .login(this.loginForm.getRawValue())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => void this.router.navigate(['/dashboard']),
        error: (error: ApiError) => {
          this.errorMessage.set(error.message);
          if (error.fields) {
            this.fieldErrors.set(error.fields);
          }
        },
      });
  }
}
