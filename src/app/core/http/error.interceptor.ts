import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../services/toast.service';

const SESSION_EXPIRED_STATUSES = new Set([401, 403]);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        SESSION_EXPIRED_STATUSES.has(error.status) &&
        !req.url.endsWith('/auth/login')
      ) {
        if (authService.token()) {
          toastService.warning(
            'Sesión expirada',
            'Tu sesión ha expirado. Por favor inicia sesión nuevamente.'
          );
        }
        authService.clearSession(true);
      }
      return throwError(() => error);
    })
  );
};
