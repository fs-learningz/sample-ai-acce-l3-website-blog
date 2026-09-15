import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

const TOKEN_KEY = 'blog-jwt';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface LoginResponse {
  token: string;
  expiresAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:10010/api/v1/auth';

  private readonly _token = signal<string | null>(this.readToken());
  private readonly _currentUser = signal<CurrentUser | null>(this.decodeUser(this.readToken()));

  readonly isLoggedIn = this._token.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(tap((response) => this.setToken(response.token)));
  }

  logout(): void {
    this._token.set(null);
    this._currentUser.set(null);
    localStorage.removeItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return this._token();
  }

  isAdmin(): boolean {
    return this._currentUser()?.role === 'Admin';
  }

  private setToken(token: string): void {
    this._token.set(token);
    this._currentUser.set(this.decodeUser(token));
    localStorage.setItem(TOKEN_KEY, token);
  }

  private readToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private decodeUser(token: string | null): CurrentUser | null {
    if (!token) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
          .join(''),
      );
      const claims = JSON.parse(json);
      return { id: claims.sub, name: claims.name, email: claims.email, role: claims.role };
    } catch {
      return null;
    }
  }
}
