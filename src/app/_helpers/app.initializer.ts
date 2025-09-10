import { AccountService } from '@app/_services/account.service';

export function appInitializer(accountService: AccountService) {
  console.log('app initialize')
  return () =>
    new Promise<void>((resolve) => {
      // Check if there's an account in localStorage first
      const storedAccount = localStorage.getItem('account');
      if (storedAccount) {
        try {
          const account = JSON.parse(storedAccount);
          // Only attempt refresh if we have a JWT token
          if (account && account.jwtToken) {
            console.log('Found stored account with JWT token, attempting refresh');
            accountService.refreshToken().subscribe({
              next: () => {
                console.log('Token refreshed successfully');
                resolve();
              },
              error: (error) => {
                console.log('Token refresh failed:', error);
                // Clear invalid account data
                localStorage.removeItem('account');
                resolve();
              }
            });
          } else {
            console.log('Stored account has no JWT token, clearing storage');
            localStorage.removeItem('account');
            resolve();
          }
        } catch (error) {
          console.log('Error parsing stored account:', error);
          localStorage.removeItem('account');
          resolve();
        }
      } else {
        // No stored account, just resolve
        console.log('No stored account found');
        resolve();
      }
    });
}
