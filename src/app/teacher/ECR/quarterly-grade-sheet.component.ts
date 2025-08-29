import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '@app/_services/account.service';
import { AlertService } from '@app/_services/alert.service';
import { GradingService } from '@app/_services/grading.service';
import { SubjectService } from '@app/_services/subject.service';
import { first } from 'rxjs';

@Component({
  standalone: true,
  templateUrl: 'quarterly-grade-sheet.component.html',
  imports: [CommonModule],
})
export class QuarterlyGradeSheetComponent implements OnInit {
  quarter: string;
  loading: boolean = false;
  students: any;
  teacher_subject_id: string;
  account = this.accountService.accountValue;
  showLockModal = false;

  constructor(
    private route: ActivatedRoute,
    private gradingService: GradingService,
    private alertService: AlertService,
    private accountService: AccountService,
    private subjectService: SubjectService
  ) {
    this.route.parent?.paramMap.subscribe((params) => {
      this.teacher_subject_id = params.get('id')!;
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.route.paramMap.subscribe((params) => {
      this.quarter = params.get('quarter')!;
      console.log(this.quarter)
      this.gradingService
        .getQuarterlyGradeSheet(this.teacher_subject_id, {
          quarter: this.quarter,
        })
        .pipe(first())
        .subscribe({
          next: (students) => {
            this.students = students;
            this.loading = false
          },
          error: (error) => {
            console.error('Error loading student:', error);
          },
        });
    });
  }

  printGradeSheet() {
    console.log('print time');
    window.print();
  }


  openLockModal() {
    this.showLockModal = true;
  }

  closeLockModal() {
    this.showLockModal = false;
  }

  lockGrades() {
    this.showLockModal = false;
    this.alertService.success('grades are now LOCK!')

    console.log(this.teacher_subject_id)

     const grades = this.students.map((s: any) => ({
        enrollment_id: s.enrollment_id,
        transmutedGrade: s.transmutedGrade,
        quarter: this.quarter
      }));
    
      console.log(grades)
  }
}
