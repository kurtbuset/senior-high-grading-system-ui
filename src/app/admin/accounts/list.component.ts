import { Component, OnInit } from "@angular/core";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { first } from 'rxjs/operators';

import { AccountService } from '@app/_services/account.service';
import { AlertService } from '@app/_services/alert.service';
import { Account } from '@app/_models/account';
import { Role } from '@app/_models/role';

@Component({
  standalone: true,
  templateUrl: 'list.component.html',
  imports: [CommonModule, RouterModule]
})
export class ListComponent implements OnInit {
  accounts: Account[] = [];
  loading = false;
  Role = Role;

  constructor(
    private accountService: AccountService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.loading = true;
    this.accountService.getAllAccounts()
      .pipe(first())
      .subscribe({
        next: (accounts) => {
          // Filter to show all accounts except regular users (Students)
          this.accounts = accounts.filter(account =>
            account.role === Role.Teacher || account.role === Role.Admin || account.role === Role.SuperAdmin
          );
          this.loading = false;
        },
        error: (error) => {
          this.alertService.error(error);
          this.loading = false;
        }
      });
  }

  deleteAccount(id: string, role: Role) {
    console.log('Delete button clicked for account ID:', id, 'Role:', role);
    
    // Prevent deletion of SuperAdmin accounts
    if (role === Role.SuperAdmin) {
      const currentUser = this.accountService.accountValue;
      console.log('Current user role:', currentUser?.role);
      
      // Only SuperAdmins can delete other SuperAdmin accounts
      if (currentUser.role !== Role.SuperAdmin) {
        this.alertService.error('Only SuperAdmin users can delete SuperAdmin accounts');
        return;
      }
    }
    
    if (confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      console.log('User confirmed deletion');
      
      // Show a loading state or disable the button to prevent multiple clicks
      const accountToDelete = this.accounts.find(a => a.id === id);
      if (accountToDelete) {
        console.log('Account found, proceeding with deletion');
        
        // Optimistically remove from UI
        const previousAccounts = [...this.accounts];
        this.accounts = this.accounts.filter(a => a.id !== id);
        
        this.accountService.deleteAccount(id)
          .pipe(first())
          .subscribe({
            next: (response: any) => {
              console.log('Account deletion successful');
              this.alertService.success('Account deleted successfully');
              // Account is already removed from UI, no need to do it again
            },
            error: (error) => {
              console.log('Account deletion failed:', error);
              
              // Restore the account in the UI if deletion failed
              this.accounts = previousAccounts;
              
              // Handle different types of errors
              let errorMessage = 'An error occurred while deleting the account';
              
              // Extract error message from different possible formats
              if (typeof error === 'string') {
                errorMessage = error;
              } else if (error && error.error) {
                if (typeof error.error === 'string') {
                  errorMessage = error.error;
                } else if (error.error.message) {
                  errorMessage = error.error.message;
                }
              } else if (error && error.message) {
                errorMessage = error.message;
              } else if (error && error.status) {
                switch (error.status) {
                  case 401:
                    errorMessage = 'You are not authorized to delete this account';
                    break;
                  case 403:
                    errorMessage = 'Access forbidden: You do not have permission to delete this account';
                    break;
                  case 404:
                    errorMessage = 'Account not found';
                    break;
                  case 500:
                    errorMessage = 'Server error: Could not delete account';
                    break;
                  default:
                    errorMessage = `Error ${error.status}: ${error.statusText || 'Unknown error'}`;
                }
              }
              
              this.alertService.error(errorMessage);
              
              // If it's an auth issue, reload the list
              if (error.status === 401 || error.status === 403) {
                this.loadAccounts();
              }
            }
          });
      } else {
        console.log('Account not found');
      }
    } else {
      console.log('User cancelled deletion');
    }
  }
}
