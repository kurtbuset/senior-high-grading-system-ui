import { AccountService } from '@app/_services/account.service';

export function appInitializer(accountService: AccountService) {
  console.log('app initialize')
  return () =>
    new Promise<void>((resolve) => {
      // attempt to refresh token on app start up to auto authenticate
      accountService.refreshToken().subscribe({
        next: () => resolve(),
        error: () => resolve(), // even if it fails, resolve so app can load
      });
    });
}
