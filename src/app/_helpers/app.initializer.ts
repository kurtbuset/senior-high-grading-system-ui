import { AccountService } from '@app/_services/account.service';

export function appInitializer(accountService: AccountService) {
  console.log('App initializing...')
  return () =>
    new Promise<void>((resolve) => {
      // attempt to refresh token on app start up to auto authenticate
      accountService.refreshToken().subscribe({
        next: () => {
          console.log('Authentication refreshed successfully');
          resolve();
        },
        error: (error) => {
          console.log('Authentication refresh failed - user needs to login');
          // Don't auto-login users - let them go through the login process
          resolve(); // resolve so app can load
        },
      });
    });
}
