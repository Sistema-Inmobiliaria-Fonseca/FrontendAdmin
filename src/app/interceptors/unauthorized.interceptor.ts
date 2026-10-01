import { HttpErrorResponse } from '@angular/common/http';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

const LOGIN_URL = '/api/auth/login';

/**
 * Si la API responde 401 (token vencido, revocado o usuario desactivado) la
 * sesión local ya no sirve: se descarta y se vuelve al login. La petición de
 * login queda fuera para que el formulario pueda mostrar el error.
 */
export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url === LOGIN_URL) {
    return next(req);
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        authService.logout();
        void router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};