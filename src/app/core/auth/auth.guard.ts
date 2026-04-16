import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Action, RecordType } from './auth.types';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state: RouterStateSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated) {
    return true;
  }

  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const permissionGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const recordType = route.data['recordType'] as RecordType | undefined;
  const action = route.data['action'] as Action | undefined;

  if (!recordType || !action) {
    return true;
  }

  if (auth.can(recordType, action)) {
    return true;
  }

  return router.createUrlTree(['/unauthorized']);
};
