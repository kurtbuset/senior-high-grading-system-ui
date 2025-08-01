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
          // Filter to show only Teacher and Admin accounts (not SuperAdmin)
          this.accounts = accounts.filter(account =>
            account.role === Role.Teacher || account.role === Role.Admin
          );
          this.loading = false;
        },
        error: (error) => {
          this.alertService.error(error);
          this.loading = false;
        }
      });
  }

  deleteAccount(id: string) {
    if (confirm('Are you sure you want to delete this account?')) {
      this.accountService.deleteAccount(id)
        .pipe(first())
        .subscribe({
          next: () => {
            this.alertService.success('Account deleted successfully');
            this.loadAccounts(); // Reload the list
          },
          error: (error) => {
            this.alertService.error(error);
          }
        });
    }
  }
}
