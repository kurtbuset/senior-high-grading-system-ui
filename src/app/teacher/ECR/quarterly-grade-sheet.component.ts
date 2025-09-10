import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '@app/_services/account.service';
import { AlertService } from '@app/_services/alert.service';
import { GradingService } from '@app/_services/grading.service';
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

  allLocked: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private gradingService: GradingService,
    private alertService: AlertService,
    private accountService: AccountService,
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
            this.allLocked = students.every((s: any) => s.locked);
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

     const values = this.students.map((s: any) => ({
        enrollment_id: s.enrollment_id,
        final_grade: s.transmutedGrade,
        quarter: this.quarter
      }));
    
      console.log(values)

      this.gradingService
        .addTransmutedGrade(values)
        .pipe(first())
        .subscribe({
          next: _ => {
            console.log('success!')
            this.ngOnInit(); 
          },
          error: err => {
            console.log(err)
          }
        })
  }
}
