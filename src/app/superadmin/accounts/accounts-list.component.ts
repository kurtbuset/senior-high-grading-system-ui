import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms"; // ✅ Needed for ngModel
import { AccountService } from "@app/_services/account.service";
import { RouterModule } from '@angular/router';

@Component({
  selector: "app-accounts-list",
  templateUrl: "accounts-list.component.html",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class AccountsListComponent implements OnInit {
  accounts: any[] = [];
  filteredAccounts: any[] = [];
  paginatedAccounts: any[] = [];

  loading = true;
  searchTerm = "";

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  constructor(private accountService: AccountService) {}

  ngOnInit() {
    this.accountService.getAll().subscribe({
      next: (data) => {
        this.accounts = data;
        this.filteredAccounts = [...this.accounts];
        this.updatePagination();
        this.loading = false;
      },
      error: (err) => {
        console.error("Error fetching accounts:", err);
        this.loading = false;
      },
    });
  }

  // 🔍 Apply search filter
  applyFilter() {
    const term = this.searchTerm.toLowerCase();
    this.filteredAccounts = this.accounts.filter((acc) => {
      const name = `${acc.firstName} ${acc.lastName}`.toLowerCase();
      const email = acc.email?.toLowerCase() || "";
      const role = acc.role?.toLowerCase() || "";
      const status = acc.isActive == 1 ? "active" : "inactive";
      return (
        name.includes(term) ||
        email.includes(term) ||
        role.includes(term) ||
        status.includes(term)
      );
    });
    this.currentPage = 1;
    this.updatePagination();
  }

  // 🔢 Update paginated view
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredAccounts.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedAccounts = this.filteredAccounts.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }
  
}
