import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountService } from '@app/_services/account.service';
import { AlertService } from '@app/_services/alert.service';
import { GradingService } from '@app/_services/grading.service';
import { first } from 'rxjs';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';
import { SubjectService } from '@app/_services/subject.service';
import { filter } from 'rxjs/operators';

@Component({
  standalone: true,
  templateUrl: 'quarterly-grade-sheet.component.html',
  imports: [CommonModule, FormsModule],
})
export class QuarterlyGradeSheetComponent implements OnInit {
  quarter!: string;
  teacherSubjectId!: string;
  students: any[] = [];
  loading = false;
  showLockModal = false;
  showUnlockModal = false;
  unlockReason: string = '';
  lockStatus: string | null = null;
  allLocked: any;
  subjectInfo: any;

  account = this.accountService.accountValue;

  constructor(
    private subjectService: SubjectService,
    private route: ActivatedRoute,
    private gradingService: GradingService,
    private alertService: AlertService,
    private accountService: AccountService
  ) {}

  async ngOnInit(): Promise<void> {
    this.route.parent?.paramMap.subscribe((params) => {
      this.teacherSubjectId = params.get('id')!;
      this.loadQuarterData();
    });

    this.subjectService.subject
      .pipe(filter((subject) => subject !== null))
      .subscribe((subject) => {
        this.subjectInfo = subject;
        console.log(this.subjectInfo); // Only logs actual subject
      });
  }

  private loadQuarterData(): void {
    this.loading = true;
    this.route.paramMap.subscribe((params) => {
      this.quarter = params.get('quarter')!;
      this.gradingService
        .getQuarterlyGradeSheet(this.teacherSubjectId, {
          quarter: this.quarter,
        })
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
    this.unlockReason = '';
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
    this.loading = true;
    this.gradingService
      .requestToUnlock(this.teacherSubjectId, {
        quarter: this.quarter,
      })
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success(
            'Unlocking Grades successfully!'
          );
          this.closeUnlockModal();
          this.ngOnInit();
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
