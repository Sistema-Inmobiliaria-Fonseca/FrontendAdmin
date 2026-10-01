import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

/**
 * Sobre de la API. El backend siempre responde
 * `{ success, data }` o `{ success: false, error: { code, message, details } }`.
 *
 * Este servicio desenvuelve el `data` para que el resto de la app nunca lo vea
 * crudo, y convierte cualquier fallo en un `ApiError` con mensaje en español.
 */
export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { code: number; message: string; details?: unknown };
}

export interface ApiError {
  message: string;
  fields?: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  get<T>(url: string, params?: Record<string, string | number | undefined>): Observable<T> {
    return this.unwrap<T>(this.http.get<ApiEnvelope<T>>(url, { params: toParams(params) }));
  }

  post<T>(url: string, body: unknown): Observable<T> {
    return this.unwrap<T>(this.http.post<ApiEnvelope<T>>(url, body));
  }

  put<T>(url: string, body: unknown): Observable<T> {
    return this.unwrap<T>(this.http.put<ApiEnvelope<T>>(url, body));
  }

  delete<T>(url: string): Observable<T | null> {
    return this.http.delete<ApiEnvelope<T>>(url).pipe(map((response) => response?.data ?? null));
  }

  /** Error normalizado de un fallo de red o de un status de error. */
  normalizeError(error: unknown): ApiError {
    if (!(error instanceof HttpErrorResponse)) {
      return {
        message: error instanceof Error ? error.message : 'Ocurrió un error inesperado. Intenta nuevamente.',
      };
    }

    const body = error.error as ApiEnvelope<never> | null;

    return {
      message:
        body?.error?.message ??
        (error.status === 0
          ? 'No se pudo conectar con el servidor. Verifica que la API esté activa.'
          : 'Ocurrió un error inesperado. Intenta nuevamente.'),
      fields: extractFieldErrors(body?.error?.details),
    };
  }

  private unwrap<T>(source: Observable<ApiEnvelope<T>>): Observable<T> {
    return source.pipe(map((response) => response.data as T));
  }
}

function toParams(params?: Record<string, string | number | undefined>): HttpParams | undefined {
  if (!params) {
    return undefined;
  }

  return Object.entries(params).reduce(
    (acumulado, [clave, valor]) => (valor === undefined ? acumulado : acumulado.set(clave, String(valor))),
    new HttpParams(),
  );
}

function extractFieldErrors(details: unknown): Record<string, string> | undefined {
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
      Object.entries(details as Record<string, unknown>).filter(([, value]) => typeof value === 'string'),
    ) as Record<string, string>;

    return Object.keys(fields).length > 0 ? fields : undefined;
  }

  return undefined;
}