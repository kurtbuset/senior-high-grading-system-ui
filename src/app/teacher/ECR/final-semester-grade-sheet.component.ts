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
import { Router } from '@angular/router';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';
import { filter } from 'rxjs/operators';

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
  subjectInfo: any;

  constructor(
    private route: ActivatedRoute,
    private subjectService: SubjectService,
    private gradingService: GradingService,
    private accountService: AccountService,
    private router: Router
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

    this.subjectService.subject
      .pipe(filter((subject) => subject !== null))
      .subscribe((subject) => {
        this.subjectInfo = subject;
        console.log(this.subjectInfo); // Only logs actual subject
      });
  }

  goToStudentList() {
    this.router.navigate([`/teacher/students/${this.id}`]);
  }

  async exportToExcel(): Promise<void> {
    this.loading = true;
    try {
      // ✅ 1. Load the base workbook template
      const fileName = 'assets/FINAL SEMESTER GRADE.xlsx';
      const response = await fetch(fileName);
      if (!response.ok) throw new Error('Template not found in assets');

      const arrayBuffer = await response.arrayBuffer();
      const workbook = new Workbook();
      await workbook.xlsx.load(arrayBuffer);

      // ✅ 2. Fetch both quarters in parallel
      const [firstQuarterRes, secondQuarterRes] = await Promise.all([
        this.gradingService
          .getQuarterlyGradeSheet(this.id, { quarter: 'First Quarter' })
          .pipe(first())
          .toPromise(),
        this.gradingService
          .getQuarterlyGradeSheet(this.id, { quarter: 'Second Quarter' })
          .pipe(first())
          .toPromise(),
      ]);

      // ✅ 3. Helper to fill individual quarter sheets
      const fillQuarterSheet = (
        worksheetName: string,
        data: any,
        quarter: string
      ) => {
        const worksheet = workbook.getWorksheet(worksheetName);
        if (!worksheet) throw new Error(`Worksheet ${worksheetName} not found`);
        if (!data?.students?.length) return;

        const startRow = 12;
        const colMap: Record<string, number> = {
          lastName: 2,
          firstName: 4,
          middleInitial: 6,
          sex: 7,
          wwPercentageScore: 9,
          ptPercentageScore: 13,
          qaPercentageScore: 17,
          wwWeightedScore: 20,
          ptWeightedScore: 24,
          qaWeightedScore: 29,
          initialGrade: 32,
          transmutedGrade: 35,
          description: 36,
        };

        // ✅ Fill Subject & Teacher info
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
        worksheet.getRow(8).getCell(5).value = quarter.toUpperCase(); // E
        worksheet
          .getRow(102)
          .getCell(
            2
          ).value = `${this.account.firstName} ${this.account.lastName}`;

        // ✅ Fill student rows
        data.students.forEach((student: any, index: number) => {
          const row = worksheet.getRow(startRow + index);
          row.getCell(colMap.lastName).value = student.lastName;
          row.getCell(colMap.firstName).value = student.firstName;
          row.getCell(colMap.middleInitial).value = student.middleInitial || '';
          row.getCell(colMap.sex).value = student.sex || '';
          row.getCell(colMap.wwPercentageScore).value =
            student.wwPercentageScore;
          row.getCell(colMap.ptPercentageScore).value =
            student.ptPercentageScore;
          row.getCell(colMap.qaPercentageScore).value =
            student.qaPercentageScore;
          row.getCell(colMap.wwWeightedScore).value = student.wwWeightedScore;
          row.getCell(colMap.ptWeightedScore).value = student.ptWeightedScore;
          row.getCell(colMap.qaWeightedScore).value = student.qaWeightedScore;
          row.getCell(colMap.initialGrade).value = student.initialGrade;
          row.getCell(colMap.transmutedGrade).value = student.transmutedGrade;
          row.getCell(colMap.description).value = student.description || '';
          row.commit();
        });
      };

      // ✅ 4. Fill both quarter sheets
      fillQuarterSheet(
        'FIRST QTR GRADE SHEET',
        firstQuarterRes,
        'First Quarter'
      );
      fillQuarterSheet(
        'SECOND QTR GRADE SHEET',
        secondQuarterRes,
        'Second Quarter'
      );

      // ✅ 5. Fill Final Semester Sheet (with subject + teacher info)
      const finalWorksheet = workbook.getWorksheet('SEMESTER FINAL GRADE');
      if (!finalWorksheet) throw new Error('Final worksheet not found');

      // Subject & teacher info
      finalWorksheet.getRow(6).getCell(20).value =
        this.subjectInfo?.school_year || ''; // T
      finalWorksheet.getRow(6).getCell(29).value =
        this.subjectInfo?.grade_level || ''; // AC
      finalWorksheet.getRow(6).getCell(35).value =
        this.subjectInfo?.section || ''; // AI
      finalWorksheet.getRow(8).getCell(17).value =
        this.subjectInfo?.subjectName || ''; // Q
      finalWorksheet.getRow(8).getCell(5).value =
        `${this.subjectInfo?.semester} FINAL GRADE` || ''; // E
      finalWorksheet
        .getRow(8)
        .getCell(
          31
        ).value = `${this.account.firstName} ${this.account.lastName}`; // AE
      finalWorksheet
        .getRow(102)
        .getCell(
          2
        ).value = `${this.account.firstName} ${this.account.lastName}`;

      // ✅ Fill student grades
      const startRow = 12;
      this.students.forEach((student: any, index: number) => {
        const row = finalWorksheet.getRow(startRow + index);
        row.getCell(2).value = student.lastName;
        row.getCell(4).value = student.firstName;
        row.getCell(5).value = student.middleInitial || '';
        row.getCell(6).value = student.sex || '';
        row.getCell(10).value = student.firstQuarter;
        row.getCell(18).value = student.secondQuarter;
        row.getCell(24).value = student.average;
        row.getCell(29).value = student.average;
        row.getCell(32).value = student.remarks || '';
        row.getCell(36).value = student.description || '';
        row.commit();
      });

      // ✅ 6. Save Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      FileSaver.saveAs(
        new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        `Final Semester - ${this.subjectInfo?.subjectName} ${this.subjectInfo?.section}.xlsx`
      );
    } catch (error) {
      console.error('Export to Excel failed:', error);
      alert('Export failed. Check console.');
    } finally {
      this.loading = false;
    }
  }
}
