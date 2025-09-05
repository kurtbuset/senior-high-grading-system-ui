import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AccountService } from '@app/_services/account.service';

export const authGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const accountService = inject(AccountService);
  const account = accountService.accountValue;

  if (account) {
    if (route.data?.roles && !route.data.roles.includes(account.role)) {
      return false; // or redirect somewhere else
    }
    return true;
  } 

  router.navigate(['/account/login']);
  return false;
};
