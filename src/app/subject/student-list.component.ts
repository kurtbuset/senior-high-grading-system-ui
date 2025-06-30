import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { StudentService } from "@app/_services/student.service";
import { CommonModule } from "@angular/common";
import { first } from 'rxjs';

@Component({ selector: 'students', standalone: true, templateUrl: 'student-list.component.html', imports: [CommonModule]})
export class StudentListComponent implements OnInit{
  // account = this.accountService.accountValue
  students: any[]
  id: string
  
  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService
  ){ }

  
  ngOnInit(){
    this.id = this.route.snapshot.paramMap.get('id')
    // console.log('teacher subject assignemnt id:', this.id)
    this.studentService 
      .getStudentsByTeacherSubjectId(Number(this.id))
      .pipe(first())
      .subscribe((students) => this.students = students)
  }
}