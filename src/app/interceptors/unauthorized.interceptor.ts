import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * Si la API responde 401 en una petición que ENVIABA token, la sesión ya no sirve.
 * Se descartan peticiones de login o peticiones anónimas para evitar borrado accidental.
 */
export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      const isLoginRequest = req.url.includes('/api/auth/login');
      const hasAuthHeader = req.headers.has('Authorization');

      // Solo forzar logout si NO es la ruta de login Y la petición llevaba el token
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isLoginRequest &&
        hasAuthHeader
      ) {
        authService.logout();
        void router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
