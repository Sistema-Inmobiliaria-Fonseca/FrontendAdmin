import { HttpInterceptorFn } from '@angular/common/http';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('inmobiliaria_admin_session') : null;

  if (!raw) {
    return next(req);
  }

  try {
    const token = (JSON.parse(raw) as { token?: string }).token;

    if (!token) {
      return next(req);
    }

    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  } catch {
    return next(req);
  }
};
