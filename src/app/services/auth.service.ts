import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { User, UserRole } from '../models/user';

const TOKEN_KEY = 'blog-jwt';

interface LoginResponse {
  token: string;
  userId: string;
  username: string;
  role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:10010/api/auth';

  private readonly _token = signal<string | null>(this.readToken());
  private readonly _currentUser = signal<User | null>(null);

  readonly isLoggedIn = computed(() => this._token() !== null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAdmin = computed(() => this._currentUser()?.role === 'Admin');

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((response) => {
        this.setToken(response.token);
        this._currentUser.set({
          id: response.userId,
          username: response.username,
          role: response.role,
          createdAt: '',
        });
      }),
    );
  }

  loadCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(tap((user) => this._currentUser.set(user)));
  }

  /** Resolves the current user, fetching it from the API if a token exists but the profile hasn't loaded yet (e.g. after a page refresh). */
  ensureUserLoaded(): Observable<User | null> {
    if (this._token() === null) {
      return of(null);
    }

    const user = this._currentUser();
    if (user) {
      return of(user);
    }

    return this.loadCurrentUser().pipe(
      map((loaded) => loaded),
      catchError(() => {
        this.logout();
        return of(null);
      }),
    );
  }

  logout(): void {
    this._token.set(null);
    this._currentUser.set(null);
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
