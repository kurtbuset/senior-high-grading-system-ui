import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AccountService } from "@app/_services/account.service";
import { AlertService } from "@app/_services/alert.service";
import { first } from 'rxjs/operators';

@Component({ 
  standalone: true, 
  templateUrl: 'list.component.html',
  imports: [CommonModule, RouterModule]
})
export class ListComponent implements OnInit {
  accounts: any[] = [];
  loading = false;

  constructor(
    private accountService: AccountService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.loading = true;
    this.accountService.getAll()
      .pipe(first())
      .subscribe({
        next: (accounts) => {
          this.accounts = accounts;
          this.loading = false;
        },
        error: () => {
          console.log('Backend unavailable - checking local storage');
          // Load locally created accounts from localStorage
          const localAccounts = JSON.parse(localStorage.getItem('localAccounts') || '[]');
          this.accounts = localAccounts;
          this.loading = false;
        }
      });
  }

  deleteAccount(id: string) {
    const account = this.accounts.find(a => a.id === id);
    if (!account) return;

    if (confirm(`Are you sure you want to delete ${account.firstName} ${account.lastName}?`)) {
      this.accountService.delete(id)
        .pipe(first())
        .subscribe({
          next: () => {
            this.accounts = this.accounts.filter(a => a.id !== id);
            this.alertService.success('Account deleted successfully');
          },
          error: () => {
            // Fallback for development - remove from localStorage and local array
            const localAccounts = JSON.parse(localStorage.getItem('localAccounts') || '[]');
            const updatedAccounts = localAccounts.filter((a: any) => a.id !== id);
            localStorage.setItem('localAccounts', JSON.stringify(updatedAccounts));
            this.accounts = this.accounts.filter(a => a.id !== id);
            this.alertService.success('Account deleted successfully (development mode)');
          }
        });
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'Admin': return '#dc2626'; // Red
      case 'SuperAdmin': return '#7c2d12'; // Dark red
      case 'Teacher': return '#1e3a8a'; // Dark blue
      case 'Student': return '#0ea5e9'; // Light blue
      default: return '#374151'; // Default gray
    }
  }
}
