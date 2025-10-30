import { Component, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from '@angular/router';
import { StudentService } from '@app/_services/student.service'; // ✅ import service

@Component({
  standalone: true,
  templateUrl: 'student-list.component.html',
  imports: [CommonModule, FormsModule, RouterModule],
})
export class StudentListComponent implements OnInit {
  accounts: any[] = [];
  filteredAccounts: any[] = [];
  paginatedAccounts: any[] = [];
  
  loading = true;
  searchTerm = "";
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  
  constructor(private studentService: StudentService) {} // ✅ inject service
  
  ngOnInit() {
    this.loadStudents();
  }

  // 🧠 Fetch data from backend
  loadStudents() {
    this.loading = true;
    this.studentService.getAllStudents().subscribe({
      next: (data) => {
        // assuming data is an array of students
        this.accounts = data.map((student: any) => ({
          id: student.id,
          firstName: student.account?.firstName || '',
          lastName: student.account?.lastName || '',
          email: student.account?.email || '',
          school_id: student.school_id
        }));
        this.filteredAccounts = [...this.accounts];
        this.updatePagination();
      },
      error: (err) => {
        console.error('Error fetching students:', err);
      },
      complete: () => {
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
      const section = acc.section?.toLowerCase() || "";
      const strand = acc.strand?.toLowerCase() || "";
      return (
        name.includes(term) ||
        email.includes(term) ||
        section.includes(term) ||
        strand.includes(term)
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
