import { Component, OnInit } from '@angular/core';
import { SubjectService } from '@app/_services/subject.service';
import { first } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Subject } from '@app/_models/Subject';
import { CommonModule } from '@angular/common';
import { StudentService } from '@app/_services/student.service';
import { RouterModule } from '@angular/router';

@Component({
  templateUrl: 'final-semester-grade-sheet.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class FinalSemesterGradeSheetComponent implements OnInit {
  subject$ = this.subjectService.subject;
  students: any;

  id: string;
  constructor(
    private route: ActivatedRoute,
    private subjectService: SubjectService,
    private studentService: StudentService
  ) {}


  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')
    this.studentService
      .getEnrolledStudents(Number(this.id))
      .pipe(first())
      .subscribe((students) => {
        console.log(students);
        this.students = students;
      });

      // console.log(this.subjectService.subjectValue)
  }
}
