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
  constructor(
    private route: ActivatedRoute,
    private subjectService: SubjectService,
    private gradingService: GradingService,
    private accountService: AccountService
  ) {}


  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')

    this.gradingService
      .getFinalSemesterGradeSheet(this.id)
      .pipe(first())
      .subscribe((students) => {
        // console.log(students);
        this.students = students;
      });
  }

  printGradeSheet() {
    console.log('print time')
    window.print();
  }
}
