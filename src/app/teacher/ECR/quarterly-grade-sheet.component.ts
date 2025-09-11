import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms'; // ✅ Needed for ngModel
import { AccountService } from '@app/_services/account.service';
import { AlertService } from '@app/_services/alert.service';
import { GradingService } from '@app/_services/grading.service';
import { first } from 'rxjs';

@Component({
  standalone: true,
  templateUrl: 'quarterly-grade-sheet.component.html',
  imports: [CommonModule, FormsModule], // ✅ Import FormsModule
})
export class QuarterlyGradeSheetComponent implements OnInit {
  quarter!: string;
  teacherSubjectId!: string;
  students: any[] = [];
  loading = false;
  showLockModal = false;
  showUnlockModal = false; // ✅ modal toggle for request unlock
  unlockReason: string = ""; // ✅ stores reason input

  lockStatus: string | null = null;


  allLocked: any;

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
            this.lockStatus = res.lockStatus;
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

  openUnlockModal(): void {
    this.showUnlockModal = true;
  }

  closeUnlockModal(): void {
    this.showUnlockModal = false;
    this.unlockReason = "";
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

    this.gradingService
      .lockSubject({
        teacher_subject_id: this.teacherSubjectId,
        quarter: this.quarter,
      })
      .pipe(first())
      .subscribe({
        next: () => {
          console.log('Locking grade successful');
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

  submitUnlockRequest(): void {
    if (!this.unlockReason.trim()) {
      this.alertService.error("Please provide a reason.");
      return;
    }

    this.loading = true;
    this.gradingService
      .requestToUnlock(this.teacherSubjectId, { reason: this.unlockReason, quarter: this.quarter })
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Request to unlock submitted successfully!');
          this.closeUnlockModal();
          this.ngOnInit()
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.alertService.error('Failed to submit request.');
          this.loading = false;
        },
      });
  }
}
