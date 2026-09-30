import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, tap, throwError } from 'rxjs';

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  rol?: string;
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

export interface ApiError {
  message: string;
  fields?: Record<string, string>;
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { code: number; message: string; details?: unknown };
}

const STORAGE_KEY = 'inmobiliaria_admin_session';
const LOGIN_URL = '/api/auth/login';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly sessionState = signal<AuthSession | null>(this.restore());
  private readonly loadingState = signal(false);
  private readonly authenticatedState = signal(this.sessionState() !== null);

  readonly session = this.sessionState.asReadonly();
  readonly isAuthenticated = this.authenticatedState.asReadonly();
  readonly loading = this.loadingState.asReadonly();

  login(credentials: LoginCredentials): Observable<AuthSession> {
    this.loadingState.set(true);

    return this.http
      .post<ApiEnvelope<AuthSession>>(LOGIN_URL, {
        email: credentials.email,
        password: credentials.password,
        remember: credentials.remember,
      })
      .pipe(
        map((response) => {
          if (!response?.success || !response.data?.token) {
            throw new Error('La respuesta de autenticación no fue válida.');
          }

          return response.data;
        }),
        tap((session) => {
          this.persist(session);
          this.loadingState.set(false);
        }),
        catchError((error: unknown) => {
          this.loadingState.set(false);
          return throwError(() =>
            error instanceof HttpErrorResponse ? this.normalizeError(error) : this.normalizeErrorUnknown(error),
          );
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
      const parsed = JSON.parse(raw) as AuthSession;

      if (!parsed?.token) {
        this.clearStorage();
        return null;
      }

      return parsed;
    } catch {
      this.clearStorage();
      return null;
    }
  }

  private normalizeErrorUnknown(error: unknown): ApiError {
    return {
      message: error instanceof Error ? error.message : 'Ocurrió un error inesperado. Intenta nuevamente.',
    };
  }

  private normalizeError(error: HttpErrorResponse): ApiError {
    const body = error.error as ApiEnvelope<never> | null;

    return {
      message:
        body?.error?.message ??
        (error.status === 0
          ? 'No se pudo conectar con el servidor. Verifica que la API esté activa.'
          : 'Ocurrió un error inesperado. Intenta nuevamente.'),
      fields: this.extractFieldErrors(body?.error?.details),
    };
  }

  private extractFieldErrors(details: unknown): Record<string, string> | undefined {
    if (Array.isArray(details)) {
      const fields: Record<string, string> = {};

      for (const entry of details) {
        if (entry && typeof entry === 'object' && 'field' in entry && 'message' in entry) {
          const { field, message } = entry as { field: string; message: string };
          fields[field] = message;
        }
      }

      return Object.keys(fields).length > 0 ? fields : undefined;
    }

    if (details && typeof details === 'object') {
      const fields = Object.fromEntries(
        Object.entries(details as Record<string, unknown>).filter(
          ([, value]) => typeof value === 'string',
        ),
      ) as Record<string, string>;

      return Object.keys(fields).length > 0 ? fields : undefined;
    }

    return undefined;
  }
}
