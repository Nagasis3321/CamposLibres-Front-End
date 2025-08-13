import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor funcional que añadirá el token de autenticación a las peticiones salientes.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = localStorage.getItem('authToken'); // O authService.getToken()

  // Si hay un token, clonamos la petición y añadimos la cabecera 'Authorization'.
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  // Si no hay token, la petición continúa sin modificaciones.
  return next(req);
};
