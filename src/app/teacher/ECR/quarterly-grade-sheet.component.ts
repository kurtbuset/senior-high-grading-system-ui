import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '@app/_services/account.service';
import { AlertService } from '@app/_services/alert.service';
import { GradingService } from '@app/_services/grading.service';
import { StudentService } from '@app/_services/student.service';
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
  showLogoutModal = false;

  constructor(
    private route: ActivatedRoute,
    private gradingService: GradingService,
    private alertService: AlertService,
    private accountService: AccountService
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
            // console.log(students)
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


  openLogoutModal() {
    this.showLogoutModal = true;
  }

  closeLogoutModal() {
    this.showLogoutModal = false;
  }

  lockGrades() {
    this.showLogoutModal = false;
    this.alertService.success('grades are now LOCK!')
    // console.log(this.quarter)
    // console.log(this.students)

     const grades = this.students.map((s: any) => ({
        enrollment_id: s.enrollment_id,
        transmutedGrade: s.transmutedGrade,
        quarter: this.quarter
      }));
    
      console.log(grades)
  }
}
