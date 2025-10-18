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
  exporting = false; // <-- add this

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
          this.alertService.success('Unlocking Grades successfully!');
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
  async exportGrades(): Promise<void> {
    this.exporting = true;

    try {
      // 🟢 Validate quarter and template file
      const templates: Record<string, string> = {
        'First Quarter': 'assets/FIRST QUARTER.xlsx',
        'Second Quarter': 'assets/SECOND QUARTER.xlsx',
      };

      const fileName = templates[this.quarter];
      if (!fileName) throw new Error(`Unsupported quarter: ${this.quarter}`);

      // 🟢 Load Excel template
      const response = await fetch(fileName);
      if (!response.ok) throw new Error('Template not found in assets');

      const arrayBuffer = await response.arrayBuffer();
      const workbook = new Workbook();
      await workbook.xlsx.load(arrayBuffer);

      // 🟢 Select worksheet
      const sheetNames: Record<string, string> = {
        'First Quarter': 'FIRST QTR GRADE SHEET',
        'Second Quarter': 'SECOND QTR GRADE SHEET',
      };
      const worksheet =
        workbook.getWorksheet(sheetNames[this.quarter]) ||
        workbook.worksheets[0];

      if (!worksheet)
        throw new Error(`Worksheet for ${this.quarter} not found`);
      if (!this.students?.length)
        return this.alertService.error('No students to export!');

      // 🟢 Column map (kept for clarity)
      const col = {
        lastName: 2,
        firstName: 4,
        middleInitial: 6,
        sex: 7,
        wwPercentage: 9,
        ptPercentage: 13,
        qaPercentage: 17,
        wwWeighted: 20,
        ptWeighted: 24,
        qaWeighted: 29,
        initialGrade: 32,
        transmuted: 35,
        description: 36,
      };

      // 🟢 Fill in subject and teacher info
      const { subjectInfo, account } = this;
      worksheet.getRow(6).getCell(20).value = subjectInfo?.school_year || ''; // T
      worksheet.getRow(6).getCell(29).value = subjectInfo?.grade_level || ''; // AC
      worksheet.getRow(6).getCell(35).value = subjectInfo?.section || ''; // AI
      worksheet.getRow(8).getCell(17).value = subjectInfo?.subjectName || ''; // Q
      worksheet
        .getRow(8)
        .getCell(31).value = `${account.firstName} ${account.lastName}`; // AE
      worksheet
        .getRow(102)
        .getCell(2).value = `${account.firstName} ${account.lastName}`; // B102

      // 🟢 Write student data
      const startRow = 12;
      for (let i = 0; i < this.students.length; i++) {
        const s = this.students[i];
        const row = worksheet.getRow(startRow + i);

        Object.assign(row.values, {
          [col.lastName]: s.lastName,
          [col.firstName]: s.firstName,
          [col.middleInitial]: s.middleInitial || '',
          [col.sex]: s.sex || '',
          [col.wwPercentage]: s.wwPercentageScore,
          [col.ptPercentage]: s.ptPercentageScore,
          [col.qaPercentage]: s.qaPercentageScore,
          [col.wwWeighted]: s.wwWeightedScore,
          [col.ptWeighted]: s.ptWeightedScore,
          [col.qaWeighted]: s.qaWeightedScore,
          [col.initialGrade]: s.initialGrade,
          [col.transmuted]: s.transmutedGrade,
          [col.description]: s.description || '',
        });

        row.commit();
      }

      // 🟢 Export and save
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      FileSaver.saveAs(
        blob,
        `Grades - ${subjectInfo?.subjectName || ''} - ${
          subjectInfo?.section || ''
        } - ${this.quarter}.xlsx`
      );
    } catch (err) {
      console.error('Export to Excel failed:', err);
      this.alertService.error('Export failed. Check console.');
    } finally {
      this.exporting = false;
    }
  }
}
