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

  students: any;
  teacher_subject_id: string;
  account = this.accountService.accountValue;

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
    this.route.paramMap.subscribe((params) => {
      this.quarter = params.get('quarter')!;

      this.gradingService
        .getQuarterlyGradeSheet(this.teacher_subject_id, {
          quarter: this.quarter,
        })
        .pipe(first())
        .subscribe(((students) => {
            // console.log(params);
            this.students = students
          }));
    });
  }

  printGradeSheet() {
    console.log('print time')
    window.print();
  }
}
