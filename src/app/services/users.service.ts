import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Role, User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:10010/api/v1';

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/admin/users`);
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`);
  }

  createUser(user: {
    username: string;
    email: string;
    password: string;
    role: string;
  }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/admin/users`, user);
  }

  updateUser(id: string, user: { email: string }): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/admin/users/${id}`, user);
  }

  updateUserRole(id: string, role: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/admin/users/${id}/role`, { role });
  }

  activateUser(id: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/admin/users/${id}/activate`, {});
  }

  deactivateUser(id: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/admin/users/${id}/deactivate`, {});
  }

  resetPassword(id: string, newPassword: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/admin/users/${id}/reset-password`, { newPassword });
  }
}
