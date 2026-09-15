import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  imports: [FormsModule],
  selector: 'app-login',
  templateUrl: './login.html',
})
export class Login {
  protected username = signal('admin');
  protected password = signal('');
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  submit(): void {
    this.error.set(null);

    if (!this.username() || !this.password()) {
      this.error.set('Please enter both username and password.');
      return;
    }

    this.submitting.set(true);
    this.authService.login(this.username(), this.password()).subscribe({
      next: () => this.router.navigate(['/admin']),
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? 'Invalid username or password.');
        this.submitting.set(false);
      },
    });
  }
}
