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

  async exportToEcr(): Promise<void> {
    this.loading = true;

    try {
      const { hps, students } = await this.gradingService
        .getStudentsAndRawScores(this.id)
        .toPromise();

      const response = await fetch('assets/BLANK ECR.xlsx');
      const arrayBuffer = await response.arrayBuffer();
      const workbook = new Workbook();
      await workbook.xlsx.load(arrayBuffer);

      // 🔹 Sheet[4] → Insert student names
      const sheetStudents = workbook.worksheets[4];
      if (sheetStudents) {
        sheetStudents.getCell('L8').value = this.subjectInfo.grade_level; // Grade level → L8
        sheetStudents.getCell('L9').value = this.subjectInfo.section; // Section → L9
        const cellL10 = sheetStudents.getCell('L10');
        const subjectName = this.subjectInfo.subjectName;
        console.log(subjectName);
        const validationList = cellL10.dataValidation?.formulae?.[0]
          ?.replace(/[=']/g, '')
          .split(',');

        if (validationList && validationList.includes(subjectName)) {
          cellL10.value = subjectName;
        } else {
          console.warn(
            `⚠️ "${subjectName}" not found in dropdown. Setting it anyway.`
          );
          cellL10.value = subjectName;
        }
        sheetStudents.getCell(
          'L11'
        ).value = `${this.account.firstName} ${this.account.lastName}`; // Teacher → L11

        let row = 17; // starting row
        for (const student of students) {
          sheetStudents.getCell(`D${row}`).value = student.lastName; // Last name → column D
          sheetStudents.getCell(`F${row}`).value = student.firstName; // First name → column F
          row++;
        }
      }

      // 🔹 Sheet[6] → First Quarter
      const sheetQ1 = workbook.worksheets[5];
      if (sheetQ1) fillQuarterData(sheetQ1, hps['First Quarter'], students);

      // 🔹 Sheet[7] → Second Quarter
      const sheetQ2 = workbook.worksheets[6];
      if (sheetQ2) fillQuarterData(sheetQ2, hps['Second Quarter'], students);

      const sheetFinal = workbook.worksheets.find(
        (sheet) => sheet.name === 'SEMESTER FINAL GRADE'
      );

      if (sheetFinal) {
        let semesterLabel = '';

        if (this.subjectInfo.semester === 'FIRST SEMESTER') {
          semesterLabel = 'FIRST SEMESTER FINAL GRADE';
        } else if (this.subjectInfo.semester === 'SECOND SEMESTER') {
          semesterLabel = 'SECOND SEMESTER FINAL GRADE';
        }

        sheetFinal.getCell('E8').value = semesterLabel;
      }

      // 🔹 Save
      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `GRADES FOR K TO 12 ${this.subjectInfo.subjectName}.xlsx`;
      FileSaver.saveAs(new Blob([buffer]), fileName);
    } catch (err: any) {
      console.error('💥 Export failed:', err);
      alert(err.message || 'Export failed');
    } finally {
      this.loading = false;
    }

    // 🧩 Helper for each quarter
    function fillQuarterData(sheet, quarterData, students) {
      if (!quarterData) return;

      const rowHps = 13;
      const wwCols = 7; // G
      const ptCols = 20; // T

      // HPS
      quarterData.writtenWorks.forEach((q, i) => {
        sheet.getCell(rowHps, wwCols + i).value = q.hps;
      });
      quarterData.performanceTasks.forEach((q, i) => {
        sheet.getCell(rowHps, ptCols + i).value = q.hps;
      });
      if (quarterData.quarterlyAssessments[0]) {
        sheet.getCell('AG13').value = quarterData.quarterlyAssessments[0].hps;
      }

      // Students
      let row = 14;
      for (const student of students) {
        // sheet.getCell(`C${row}`).value = student.lastName;
        // sheet.getCell(`E${row}`).value = student.firstName;

        quarterData.writtenWorks.forEach((q, i) => {
          sheet.getCell(row, wwCols + i).value = student.scores[q.id] ?? '';
        });
        quarterData.performanceTasks.forEach((q, i) => {
          sheet.getCell(row, ptCols + i).value = student.scores[q.id] ?? '';
        });
        if (quarterData.quarterlyAssessments[0]) {
          const qaId = quarterData.quarterlyAssessments[0].id;
          sheet.getCell(`AG${row}`).value = student.scores[qaId] ?? '';
        }

        row++;
      }
    }
  }
}
