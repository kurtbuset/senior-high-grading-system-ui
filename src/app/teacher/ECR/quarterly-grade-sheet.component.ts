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
  quarter!: string;
  teacherSubjectId!: string;
  students: any[] = [];
  loading = false;
  showLockModal = false;

  allLocked: any

  account = this.accountService.accountValue;

  constructor(
    private route: ActivatedRoute,
    private gradingService: GradingService,
    private alertService: AlertService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      this.teacherSubjectId = params.get('id')!;
      this.loadQuarterData();
    });
  }

  private loadQuarterData(): void {
    this.loading = true;

    this.route.paramMap.subscribe((params) => {
      this.quarter = params.get('quarter')!;

      this.gradingService
        .getQuarterlyGradeSheet(this.teacherSubjectId, { quarter: this.quarter })
        .pipe(first())
        .subscribe({
          next: (res) => {
            this.allLocked = res.isLocked;
            this.students = res.students;
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading students:', error);
            this.loading = false;
          },
        });
    });
  }

  printGradeSheet(): void {
    window.print();
  }

  openLockModal(): void {
    this.showLockModal = true;
  }

  closeLockModal(): void {
    this.showLockModal = false;
  }

  lockGrades(): void {
    if (!this.students.length) return;

    this.showLockModal = false;
    this.alertService.success('Grades are now LOCKED!');

    const gradesPayload = this.students.map((s: any) => ({
      enrollment_id: s.enrollment_id,
      final_grade: s.transmutedGrade,
      quarter: this.quarter,
    }));

    // Lock subject first
    this.gradingService
      .lockSubject({
        teacher_subject_id: this.teacherSubjectId,
        quarter: this.quarter,
      })
      .pipe(first())
      .subscribe({
        next: () => {
          console.log('Locking grade successful');

          // Insert transmuted grades only after lock succeeds
          this.gradingService
            .addTransmutedGrade(gradesPayload)
            .pipe(first())
            .subscribe({
              next: () => {
                console.log('Inserting new grade successful!');
                this.loadQuarterData();
              },
              error: (err) => console.error('Insert grade error:', err),
            });
        },
        error: (err) => console.error('Lock subject error:', err),
      });
  }
}
