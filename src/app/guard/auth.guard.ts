import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  try {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
      return true;
    }

    // Reindirizza al login se non autenticato
    return router.createUrlTree(['/login']);
  } catch (error) {
    console.error('Errore nel guard:', error);
    const router = inject(Router);
    return router.createUrlTree(['/login']);
  }
};
