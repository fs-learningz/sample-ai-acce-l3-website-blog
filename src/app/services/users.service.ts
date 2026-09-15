import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User, UserRole } from '../models/user';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:10010/api/admin/users';

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  createUser(user: { username: string; password: string; role: UserRole }): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: string, user: { username: string; role: UserRole }): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  resetPassword(id: string, newPassword: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/password`, { newPassword });
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
