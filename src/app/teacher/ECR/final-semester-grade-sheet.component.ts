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
  exporting = false;

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
    this.exporting = true;
    try {
      const fileName = 'assets/FINAL SEMESTER GRADE.xlsx';
      const response = await fetch(fileName);
      if (!response.ok) throw new Error('Template not found in assets');

      const arrayBuffer = await response.arrayBuffer();
      const workbook = new Workbook();
      await workbook.xlsx.load(arrayBuffer);

      const worksheet =
        workbook.getWorksheet('FINAL SEMESTER GRADE') || workbook.worksheets[7];
      if (!worksheet) throw new Error('Worksheet not found');
      if (!this.students?.length) {
        alert('No students to export!');
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
        worksheet.getRow(8).getCell(5).value =
  `${this.subjectInfo?.semester} FINAL GRADE` || ''; // E
      worksheet
        .getRow(8)
        .getCell(
          31
        ).value = `${this.account.firstName} ${this.account.lastName}`; // AE

      // Teacher name at row 102, col B
      worksheet
        .getRow(102)
        .getCell(
          2
        ).value = `${this.account.firstName} ${this.account.lastName}`;

      const startRow = 12;

      const colMap: Record<string, number> = {
        lastName: 2, // B
        firstName: 4, // D
        middleInitial: 5, // E
        sex: 6, // F
        firstQuarter: 10, // J
        secondQuarter: 18, // R
        average: 24, // X
        average2: 29, // AC
        remarks: 32, // AF
        description: 36, // AJ
      };

      this.students.forEach((student, index) => {
        const rowIndex = startRow + index;
        const row = worksheet.getRow(rowIndex);

        row.getCell(colMap.lastName).value = student.lastName;
        row.getCell(colMap.firstName).value = student.firstName;
        row.getCell(colMap.middleInitial).value = student.middleInitial || '';
        row.getCell(colMap.sex).value = student.sex || '';

        row.getCell(colMap.firstQuarter).value = student.firstQuarter;
        row.getCell(colMap.secondQuarter).value = student.secondQuarter;

        row.getCell(colMap.average).value = student.average;
        row.getCell(colMap.average2).value = student.average; // duplicate as AC

        row.getCell(colMap.remarks).value = student.remarks || '';
        row.getCell(colMap.description).value = student.description || '';

        row.commit();
      });

      const buffer = await workbook.xlsx.writeBuffer();
      FileSaver.saveAs(
        new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        `Grades for K-12 ${this.subjectInfo?.subjectName} ${this.subjectInfo?.section} ${this.subjectInfo?.semester}.xlsx`
      );
    } catch (error) {
      console.log('Export to Excel failed:', error);
      alert('Export failed. Check console.');
    } finally {
      this.exporting = false
    }
  }
}
