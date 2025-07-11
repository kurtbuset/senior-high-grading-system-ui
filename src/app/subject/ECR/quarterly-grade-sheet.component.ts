import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StudentService } from '@app/_services/student.service';
import { first } from 'rxjs';

@Component({
  standalone: true,
  templateUrl: 'quarterly-grade-sheet.component.html',
  imports: [CommonModule],
})
export class QuarterlyGradeSheetComponent implements OnInit {
  quarter: string

  students: any;
  teacher_subject_id: string;

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService
  ) {
  }


  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.quarter = data['quarter'];
      // console.log('Quarter:', this.quarter);
    });
    
    this.route.parent?.paramMap.subscribe((params) => {
      this.teacher_subject_id = params.get('id')!;
    });

    // this.studentService
    //   .getQuarterlyGradeSheet(Number(this.teacher_subject_id))
    //   .pipe(first())
    //   .subscribe((students) => {
    //     this.students = students;
    //   });

    console.log('id: ', this.teacher_subject_id);
  }
}
