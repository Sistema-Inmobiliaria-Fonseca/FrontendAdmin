import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, tap, throwError } from 'rxjs';

import { ApiService } from './api.service';

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember: boolean;
}

const STORAGE_KEY = 'inmobiliaria_admin_session';
const LOGIN_URL = '/api/auth/login';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);

  private readonly sessionState = signal<AuthSession | null>(this.restore());
  private readonly loadingState = signal(false);
  private readonly authenticatedState = signal(this.sessionState() !== null);

  readonly session = this.sessionState.asReadonly();
  readonly isAuthenticated = this.authenticatedState.asReadonly();
  readonly loading = this.loadingState.asReadonly();

  login(credentials: LoginCredentials): Observable<AuthSession> {
    this.loadingState.set(true);

    return this.api
      .post<any>(LOGIN_URL, {
        email: credentials.email,
        password: credentials.password,
        remember: credentials.remember,
      })
      .pipe(
        map((response) => {
          // Extrae 'data' si viene envuelto en la respuesta estándar de PHP
          const session: AuthSession = response?.data ? response.data : response;

          if (!session?.token || !session.user) {
            throw new Error('La respuesta de autenticación no fue válida.');
          }

          return session;
        }),
        tap((session) => {
          this.persist(session);
          this.loadingState.set(false);
        }),
        catchError((error: unknown) => {
          this.loadingState.set(false);
          return throwError(() => this.api.normalizeError(error));
        }),
      );
  }

  logout(): void {
    this.clearStorage();
    this.sessionState.set(null);
    this.authenticatedState.set(false);
    this.loadingState.set(false);
  }

  private persist(session: AuthSession): void {
    this.sessionState.set(session);
    this.authenticatedState.set(true);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  }

  private clearStorage(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  private restore(): AuthSession | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw);
      // Soporta leer token tanto directo como dentro de .data por compatibilidad
      const token = parsed?.token || parsed?.data?.token;

      if (!token) {
        this.clearStorage();
        return null;
      }

      return parsed.token ? (parsed as AuthSession) : (parsed.data as AuthSession);
    } catch {
      this.clearStorage();
      return null;
    }
  }
}
