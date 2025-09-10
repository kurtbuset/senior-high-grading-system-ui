import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AccountService } from '@app/_services/account.service';

export const authGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const accountService = inject(AccountService);
  const account = accountService.accountValue;

  if (account) {
    // Check if route requires specific roles
    if (route.data?.roles && !route.data.roles.includes(account.role)) {
      // Redirect to home if user doesn't have required role
      router.navigate(['/home']);
      return false;
    }
    return true;
  } 

  // Not logged in, redirect to login page with return url
  router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
