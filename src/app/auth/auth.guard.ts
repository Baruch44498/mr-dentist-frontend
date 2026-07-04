import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login.service';

export const authGuard: CanActivateFn = (route, state) => {
  // En SSR (servidor), permitimos el paso para la renderización inicial.
  // La protección real se ejecutará inmediatamente en el navegador (cliente).
  if (typeof window === 'undefined') {
    return true;
  }

  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    return true;
  }

  // Redirigir al login si no está autenticado
  router.navigate(['/login']);
  return false;
};

export const roleGuard: CanActivateFn = (route, state) => {
  if (typeof window === 'undefined') {
    return true;
  }

  const loginService = inject(LoginService);
  const router = inject(Router);

  const expectedRole = route.data['expectedRole'] as string;
  const userRole = loginService.getRole();

  if (userRole && userRole.toUpperCase() === expectedRole.toUpperCase()) {
    return true;
  }

  // Redirigir al login si el rol no coincide
  alert(`Acceso denegado: Se requiere el rol de ${expectedRole}.`);
  router.navigate(['/login']);
  return false;
};
