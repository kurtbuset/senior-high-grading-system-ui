import { AccountService } from '@app/_services/account.service';
import { Role } from '@app/_models/role';
import { Account } from '@app/_models/account';

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
          console.log('Authentication refresh failed - using development mode');

          // For development: create a mock admin user when backend is unavailable
          const mockAdmin: Account = {
            id: '1',
            title: 'Mr',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@school.edu',
            role: Role.Admin,
            isActive: true
          };

          // Set the mock admin as the current user
          accountService.setMockAccount(mockAdmin);
          console.log('Development mode: Logged in as mock admin user');

          resolve(); // resolve so app can load
        },
      });
    });
}
