import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

const TOKEN_KEY = 'blog-admin-token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:10010/api/auth';

  private readonly _token = signal<string | null>(this.readToken());

  readonly isLoggedIn = this._token.asReadonly();

  login(username: string, password: string): Observable<{ token: string; username: string }> {
    return this.http
      .post<{ token: string; username: string }>(`${this.apiUrl}/login`, { username, password })
      .pipe(tap((response) => this.setToken(response.token)));
  }

  logout(): void {
    this._token.set(null);
    localStorage.removeItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return this._token();
  }

  private setToken(token: string): void {
    this._token.set(token);
    localStorage.setItem(TOKEN_KEY, token);
  }

  private readToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
}
