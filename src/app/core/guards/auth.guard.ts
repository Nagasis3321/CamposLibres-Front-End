import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guardián funcional para proteger rutas.
 * Verifica si el usuario está autenticado antes de permitir el acceso.
 */
export const authGuard: CanActivateFn = (route, state) => {
  // Inyectamos los servicios necesarios dentro de la función.
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el servicio dice que el usuario está autenticado, permite el acceso.
  if (authService.isAuthenticated()) {
    return true;
  }

  // Si no está autenticado, lo redirige a la página de login y bloquea el acceso.
  router.navigate(['/login']);
  return false;
};
