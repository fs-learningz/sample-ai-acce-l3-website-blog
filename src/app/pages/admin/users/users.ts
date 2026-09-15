import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { UsersService } from '../../../services/users.service';
import { Role, User } from '../../../models/user';

@Component({
  imports: [FormsModule],
  selector: 'app-admin-users',
  templateUrl: './users.html',
})
export class AdminUsers implements OnInit {
  protected readonly users = signal<User[]>([]);
  protected readonly roles = signal<Role[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly busyId = signal<string | null>(null);

  protected readonly editingId = signal<string | null>(null);
  protected readonly editEmail = signal('');

  protected readonly newUsername = signal('');
  protected readonly newEmail = signal('');
  protected readonly newPassword = signal('');
  protected readonly newRole = signal('');
  protected readonly creating = signal(false);
  protected readonly createError = signal<string | null>(null);

  private readonly usersService = inject(UsersService);

  ngOnInit(): void {
    this.load();
    this.usersService.getRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        if (roles.length > 0) {
          this.newRole.set(roles[0].name);
        }
      },
    });
  }

  load(): void {
    this.loading.set(true);
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load users. Is the API running?');
        this.loading.set(false);
      },
    });
  }

  createUser(): void {
    this.createError.set(null);

    if (!this.newUsername() || !this.newEmail() || !this.newPassword() || !this.newRole()) {
      this.createError.set('Please fill in all fields.');
      return;
    }

    this.creating.set(true);
    this.usersService
      .createUser({
        username: this.newUsername(),
        email: this.newEmail(),
        password: this.newPassword(),
        role: this.newRole(),
      })
      .subscribe({
        next: () => {
          this.creating.set(false);
          this.newUsername.set('');
          this.newEmail.set('');
          this.newPassword.set('');
          this.load();
        },
        error: (err: HttpErrorResponse) => {
          this.creating.set(false);
          this.createError.set(this.extractErrorMessage(err, 'Failed to create user.'));
        },
      });
  }

  private extractErrorMessage(err: HttpErrorResponse, fallback: string): string {
    if (typeof err.error?.message === 'string') {
      return err.error.message;
    }

    if (err.error?.errors) {
      const messages = Object.values(err.error.errors).flat() as string[];
      if (messages.length > 0) {
        return messages.join(' ');
      }
    }

    if (typeof err.error?.title === 'string') {
      return err.error.title;
    }

    return fallback;
  }

  startEdit(user: User): void {
    this.editingId.set(user.id);
    this.editEmail.set(user.email);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(user: User): void {
    this.busyId.set(user.id);
    this.usersService.updateUser(user.id, { email: this.editEmail() }).subscribe({
      next: () => {
        this.editingId.set(null);
        this.busyId.set(null);
        this.load();
      },
      error: () => this.busyId.set(null),
    });
  }

  changeRole(user: User, role: string): void {
    if (role === user.role) {
      return;
    }

    this.busyId.set(user.id);
    this.usersService.updateUserRole(user.id, role).subscribe({
      next: () => {
        this.busyId.set(null);
        this.load();
      },
      error: () => this.busyId.set(null),
    });
  }

  toggleActive(user: User): void {
    this.busyId.set(user.id);
    const action = user.isActive
      ? this.usersService.deactivateUser(user.id)
      : this.usersService.activateUser(user.id);

    action.subscribe({
      next: () => {
        this.busyId.set(null);
        this.load();
      },
      error: () => this.busyId.set(null),
    });
  }

  resetPassword(user: User): void {
    const newPassword = prompt(
      `Enter a new password for "${user.username}" (at least 10 characters, letters and numbers):`,
    );
    if (!newPassword) {
      return;
    }

    this.busyId.set(user.id);
    this.usersService.resetPassword(user.id, newPassword).subscribe({
      next: () => {
        this.busyId.set(null);
        alert('Password reset successfully.');
      },
      error: (err: HttpErrorResponse) => {
        this.busyId.set(null);
        alert(err.error?.message ?? 'Failed to reset password.');
      },
    });
  }
}
