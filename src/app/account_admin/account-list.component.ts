import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountService } from '@app/_services/account.service';
import { AlertService } from '@app/_services/alert.service';
import { Account } from '@app/_models/account';
import { Role } from '@app/_models/role';
import { first } from 'rxjs/operators';

@Component({
  selector: 'account-list',
  standalone: true,
  templateUrl: 'account-list.component.html',
  imports: [CommonModule, RouterModule],
})
export class AccountListComponent implements OnInit {
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
    this.accountService
      .getAllAccounts()
      .pipe(first())
      .subscribe({
        next: (accounts) => {
          this.accounts = accounts;
          this.loading = false;
        },
        error: (error) => {
          this.alertService.error('Failed to load accounts: ' + error);
          console.error('Failed to load accounts:', error);
          this.loading = false;
        },
      });
  }

  toggleAccountStatus(id: string, isActive: boolean) {
    const action = isActive ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} this account?`)) {
      // Send only the isActive field to update
      const updateData = { isActive: !isActive };
      
      this.accountService
        .updateAccount(id, updateData)
        .pipe(first())
        .subscribe({
          next: () => {
            this.alertService.success(`Account ${action}d successfully`);
            this.loadAccounts();
          },
          error: (error) => {
            console.error(`Failed to ${action} account:`, error);
            console.error('Update data being sent:', updateData);
            this.alertService.error(`Failed to ${action} account: ` + error);
          },
        });
    }
  }

  getRoleBadgeClass(role: Role): string {
    switch (role) {
      case Role.SuperAdmin:
        return 'badge bg-danger';
      case Role.Principal:
        return 'badge bg-primary';
      case Role.Registrar:
        return 'badge bg-info';
      case Role.Teacher:
        return 'badge bg-success';
      case Role.Student:
        return 'badge bg-secondary';
      default:
        return 'badge bg-light text-dark';
    }
  }
}
