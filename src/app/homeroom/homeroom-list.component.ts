import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeroomService } from '@app/_services/homeroom.service';
import { first } from 'rxjs';
import { RouterModule } from '@angular/router';
import { AccountService } from "@app/_services/account.service";
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  templateUrl: 'homeroom-list.component.html',
  imports: [CommonModule, RouterModule, FormsModule],
})
export class HomeroomListComponent implements OnInit {
  homerooms: any[] = [];
  filteredHomerooms: any[] = [];
  paginatedHomerooms: any[] = [];

  loading = true;
  searchTerm = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  account = this.accountService.accountValue;

  constructor(
    private homeroomService: HomeroomService,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.homeroomService
      .getHomerooms(this.account.role, this.account.id)
      .pipe(first())
      .subscribe({
        next: (data) => {
          this.homerooms = data;
          this.filteredHomerooms = [...this.homerooms];
          this.updatePagination();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading homerooms:', err);
          this.loading = false;
        },
      });
  }

  // 🔍 Search filter
  applyFilter() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredHomerooms = this.homerooms.filter((h) => {
      const grade = h.grade_level?.toString().toLowerCase() || '';
      const section = h.section?.toLowerCase() || '';
      const strand = h.strand?.toLowerCase() || '';
      const schoolYear = h.school_year?.toString().toLowerCase() || '';
      return (
        grade.includes(term) ||
        section.includes(term) ||
        strand.includes(term) ||
        schoolYear.includes(term)
      );
    });
    this.currentPage = 1;
    this.updatePagination();
  }

  // 🔢 Paginate data
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredHomerooms.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedHomerooms = this.filteredHomerooms.slice(startIndex, endIndex);
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
