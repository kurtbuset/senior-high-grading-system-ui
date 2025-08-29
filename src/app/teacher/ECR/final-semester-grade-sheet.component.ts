import { Component, OnInit } from '@angular/core';
import { SubjectService } from '@app/_services/subject.service';
import { first } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Subject } from '@app/_models/Subject';
import { CommonModule } from '@angular/common';
import { StudentService } from '@app/_services/student.service';
import { RouterModule } from '@angular/router';
import { GradingService } from '@app/_services/grading.service';
import { AccountService } from '@app/_services/account.service';

@Component({
  templateUrl: 'final-semester-grade-sheet.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class FinalSemesterGradeSheetComponent implements OnInit {
  subject$ = this.subjectService.subject;
  students: any;
  id: string;
  account = this.accountService.accountValue;
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private subjectService: SubjectService,
    private gradingService: GradingService,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.id = this.route.snapshot.paramMap.get('id');

    this.gradingService
      .getFinalSemesterGradeSheet(this.id)
      .pipe(first())
      .subscribe({
        next: (students) => {
          this.students = students;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading student:', error);
        },
      });
  }

  printGradeSheet() {
    console.log('print time');
    window.print();
  }
}
