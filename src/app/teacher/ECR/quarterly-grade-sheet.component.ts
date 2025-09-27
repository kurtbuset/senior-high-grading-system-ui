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
    if (!this.unlockReason.trim()) {
      this.alertService.error('Please provide a reason.');
      return;
    }
    this.loading = true;
    this.gradingService
      .requestToUnlock(this.teacherSubjectId, {
        reason: this.unlockReason,
        quarter: this.quarter,
      })
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success(
            'Request to unlock submitted successfully!'
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

  // ✅ Fixed export function (no Node 'stream')
  async exportToExcel(): Promise<void> {
    try {
      // choose template based on quarter
      const fileName =
        this.quarter === 'First Quarter'
          ? 'assets/FIRST QUARTER.xlsx'
          : this.quarter === 'Second Quarter'
          ? 'assets/SECOND QUARTER.xlsx'
          : null;

      if (!fileName) throw new Error(`Unsupported quarter: ${this.quarter}`);

      const response = await fetch(fileName);
      if (!response.ok) throw new Error('Template not found in assets');

      const arrayBuffer = await response.arrayBuffer();
      const workbook = new Workbook();
      await workbook.xlsx.load(arrayBuffer);

      let worksheet;
      let startRow = 12;
      const colMap: Record<string, number> = {
        lastName: 2,
        firstName: 4,
        middleInitial: 6,
        sex: 7,
        wwPercentageScore: 9, // I
        ptPercentageScore: 13, // M
        qaPercentageScore: 17, // Q
        wwWeightedScore: 20, // T
        ptWeightedScore: 24, // X
        qaWeightedScore: 29, // AC
        initialGrade: 32, // AF
        transmutedGrade: 35, // AI
        description: 36, // AJ
      };

      // select worksheet by name
      worksheet =
        this.quarter === 'First Quarter'
          ? workbook.getWorksheet('FIRST QTR GRADE SHEET') ||
            workbook.worksheets[0]
          : workbook.getWorksheet('SECOND QTR GRADE SHEET') ||
            workbook.worksheets[0];

      if (!worksheet)
        throw new Error(`Worksheet for ${this.quarter} not found`);
      if (!this.students.length) {
        this.alertService.error('No students to export!');
        return;
      }

      // Subject and teacher info
      worksheet.getRow(6).getCell(20).value =
        this.subjectInfo?.school_year || ''; // T
      worksheet.getRow(6).getCell(29).value =
        this.subjectInfo?.grade_level || ''; // AC
      worksheet.getRow(6).getCell(35).value = this.subjectInfo?.section || ''; // AI
      worksheet.getRow(8).getCell(17).value =
        this.subjectInfo?.subjectName || ''; // Q
      worksheet
        .getRow(8)
        .getCell(
          31
        ).value = `${this.account.firstName} ${this.account.lastName}`; // AE

      worksheet
        .getRow(102)
        .getCell(
          2
        ).value = `${this.account.firstName} ${this.account.lastName}`;

      this.students.forEach((student, index) => {
        const rowIndex = startRow + index;
        const row = worksheet.getRow(rowIndex);

        // student info
        row.getCell(colMap.lastName).value = student.lastName;
        row.getCell(colMap.firstName).value = student.firstName;
        row.getCell(colMap.middleInitial).value = student.middleInitial || '';
        row.getCell(colMap.sex).value = student.sex || '';

        // percentage scores
        row.getCell(colMap.wwPercentageScore).value = student.wwPercentageScore;
        row.getCell(colMap.ptPercentageScore).value = student.ptPercentageScore;
        row.getCell(colMap.qaPercentageScore).value = student.qaPercentageScore;

        // weighted scores
        row.getCell(colMap.wwWeightedScore).value = student.wwWeightedScore;
        row.getCell(colMap.ptWeightedScore).value = student.ptWeightedScore;
        row.getCell(colMap.qaWeightedScore).value = student.qaWeightedScore;

        // grades
        row.getCell(colMap.initialGrade).value = student.initialGrade;
        row.getCell(colMap.transmutedGrade).value = student.transmutedGrade;

        // description
        row.getCell(colMap.description).value = student.description || '';

        row.commit();
      });

      const buffer = await workbook.xlsx.writeBuffer();
      FileSaver.saveAs(
        new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        `Grades for K-12 ${this.subjectInfo?.subjectName} ${this.subjectInfo?.section} ${this.quarter}.xlsx`
      );
    } catch (error) {
      console.log('Export to Excel failed:', error);
      this.alertService.error('Export failed. Check console.');
    }
  }
}
