import { Component } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { StudentService } from "@app/_services/student.service";
import { first } from "rxjs";
import { CommonModule } from "@angular/common";

@Component({ templateUrl: 'first-quarter.component.html', standalone: true, imports: [CommonModule] })
export class FirstQuarterComponent{

  teacher_subject_id: string
  students: any

  constructor(private studentService: StudentService, private route: ActivatedRoute,){}

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe(params => {
      this.teacher_subject_id = params.get('id')!;
    });

    this.studentService
      .getFirstQuarterGradeSheet(Number(this.teacher_subject_id))
      .pipe(first())
      .subscribe((students) => {
        this.students = students
      })
  }
}