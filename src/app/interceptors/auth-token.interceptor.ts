import { HttpInterceptorFn } from '@angular/common/http';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof localStorage === 'undefined') {
    return next(req);
  }

  const raw = localStorage.getItem('inmobiliaria_admin_session');

  if (!raw) {
    return next(req);
  }

  try {
    const parsed = JSON.parse(raw);
    // Extraemos el token tanto si viene en la raíz como si viene dentro de .data
    const token = parsed?.token || parsed?.data?.token;

    if (!token) {
      return next(req);
    }

    // Adjuntamos el Bearer token a la petición
    return next(
      req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );
  } catch {
    return next(req);
  }
};
