import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AccountService } from '@app/_services/account.service';

export const authGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const accountService = inject(AccountService);
  const account = accountService.accountValue;

  console.log('Auth Guard: Checking access for route:', state.url, 'Account:', account);

  if (account && account.id) {
    if (route.data?.roles && !route.data.roles.includes(account.role)) {
      // User doesn't have required role, redirect to home
      console.log('Auth Guard: Insufficient role, redirecting to home');
      router.navigate(['/']);
      return false;
    }
    console.log('Auth Guard: Access granted');
    return true;
  }

  console.log('Auth Guard: No account, redirecting to login');
  router.navigate(['/account/login']);
  return false;
};
