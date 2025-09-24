import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubjectService } from '@app/_services/subject.service';
import { AccountService } from '@app/_services/account.service';
import { first } from 'rxjs';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  templateUrl: 'subject-list.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class SubjectListComponent implements OnInit {
  subjects: any[] = [];
  filteredSubjects: any[] = [];
  loading: boolean = false;
  searchTerm: string = '';

  constructor(
    private subjectService: SubjectService,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.loading = true;
    const teacher = this.accountService.accountValue;

    this.subjectService
      .getAllAssignedSubjects(Number(teacher.id))
      .pipe(first())
      .subscribe({
        next: (subjects) => {
          this.subjects = subjects;
          this.filteredSubjects = subjects; // initially show all
          this.subjectService.subjectSubject.next(null);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading subjects:', error);
          this.loading = false;
        }
      });
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredSubjects = this.subjects;
      return;
    }

    this.filteredSubjects = this.subjects.filter(a =>
      (a.subjectName?.toLowerCase().includes(term)) ||
      (a.school_year?.toString().toLowerCase().includes(term)) ||
      (a.grade_level?.toString().toLowerCase().includes(term)) ||
      (a.section?.toLowerCase().includes(term)) ||
      (a.semester?.toLowerCase().includes(term))
    );
  }
}
