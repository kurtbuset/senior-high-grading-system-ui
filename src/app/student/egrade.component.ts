import { Component, OnInit } from '@angular/core';
import { AccountService } from '@app/_services/account.service';
import { StudentService } from '@app/_services/student.service';
import { first } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  templateUrl: 'egrade.component.html',
  imports: [CommonModule, FormsModule],
})
export class EgradeComponent implements OnInit {
  account_id = this.accountService.accountValue.id;
  subjects: any[];
  selectedSemester: string = '';
  schoolYear: string;

  constructor(
    private accountService: AccountService,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.studentService
      .getSubjectsAndGrades(Number(this.account_id))
      .pipe(first())
      .subscribe({
        next: (res) => {
          this.schoolYear = res.schoolYear; // ✅ capture schoolYear
          this.subjects = res.subjects; // ✅ store subjects array
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }

  get filteredSubjects() {
    if (!this.selectedSemester) return [];

    return this.subjects.filter((s) =>
      s.semester.toLowerCase().includes(this.selectedSemester.toLowerCase())
    );
  }

  get hasSecondSemSubjects() {
    return this.subjects.some((s) =>
      s.semester.toLowerCase().includes('second')
    );
  }
}
