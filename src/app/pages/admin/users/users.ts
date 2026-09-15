import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { UsersService } from '../../../services/users.service';
import { User, UserRole } from '../../../models/user';

@Component({
  imports: [FormsModule, DatePipe],
  selector: 'app-admin-users',
  templateUrl: './users.html',
})
export class AdminUsers implements OnInit {
  protected readonly users = signal<User[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly busyId = signal<string | null>(null);

  protected readonly formOpen = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly formUsername = signal('');
  protected readonly formRole = signal<UserRole>('Author');
  protected readonly formPassword = signal('');
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load users.');
        this.loading.set(false);
      },
    });
  }

  openCreateForm(): void {
    this.editingId.set(null);
    this.formUsername.set('');
    this.formRole.set('Author');
    this.formPassword.set('');
    this.formError.set(null);
    this.formOpen.set(true);
  }

  openEditForm(user: User): void {
    this.editingId.set(user.id);
    this.formUsername.set(user.username);
    this.formRole.set(user.role);
    this.formPassword.set('');
    this.formError.set(null);
    this.formOpen.set(true);
  }

  cancelForm(): void {
    this.formOpen.set(false);
  }

  save(): void {
    const username = this.formUsername().trim();
    if (!username) {
      this.formError.set('Username is required.');
      return;
    }

    this.saving.set(true);
    this.formError.set(null);

    const id = this.editingId();
    if (id) {
      this.usersService.updateUser(id, { username, role: this.formRole() }).subscribe({
        next: () => {
          this.saving.set(false);
          this.formOpen.set(false);
          this.load();
        },
        error: (err) => this.failForm(err),
      });
      return;
    }

    const password = this.formPassword();
    if (!password || password.length < 6) {
      this.saving.set(false);
      this.formError.set('Password must be at least 6 characters.');
      return;
    }

    this.usersService.createUser({ username, password, role: this.formRole() }).subscribe({
      next: () => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.load();
      },
      error: (err) => this.failForm(err),
    });
  }

  resetPassword(user: User): void {
    const newPassword = prompt(`New password for ${user.username} (min 6 characters):`);
    if (!newPassword) {
      return;
    }
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    this.busyId.set(user.id);
    this.usersService.resetPassword(user.id, newPassword).subscribe({
      next: () => this.busyId.set(null),
      error: () => {
        this.busyId.set(null);
        alert('Failed to reset password.');
      },
    });
  }

  delete(user: User): void {
    if (!confirm(`Delete user "${user.username}"? This cannot be undone.`)) {
      return;
    }

    this.busyId.set(user.id);
    this.usersService.deleteUser(user.id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.busyId.set(null);
        alert(err.error?.message ?? 'Failed to delete user.');
      },
    });
  }

  isSelf(user: User): boolean {
    return this.authService.currentUser()?.id === user.id;
  }

  private failForm(err: HttpErrorResponse): void {
    this.saving.set(false);
    this.formError.set(err.error?.message ?? 'Failed to save user.');
  }
}
