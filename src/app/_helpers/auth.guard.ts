import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AccountService } from '@app/_services/account.service';

export const authGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const accountService = inject(AccountService);
  const account = accountService.accountValue;

  if (account) {
    if (route.data?.roles && !route.data.roles.includes(account.role)) {
      // User doesn't have required role, redirect to home
      router.navigate(['/']);
      return false;
    }
    return true;
  }

  router.navigate(['/account/login']);
  return false;
};
