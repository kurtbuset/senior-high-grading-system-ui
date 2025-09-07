import { Component, OnInit } from "@angular/core";
import { AccountService } from "@app/_services/account.service";
import { CommonModule } from "@angular/common";
import { StudentService } from "@app/_services/student.service";
import { first } from "rxjs";

@Component({ templateUrl: 'details.component.html', standalone: true, imports: [CommonModule]})
export class DetailsComponent implements OnInit{
  account = this.accountService.accountValue
  student: any

  constructor(
    private accountService: AccountService,
    private studentService: StudentService
  ){}

  ngOnInit(): void {
    this.studentService
      .getStudentInfo(Number(this.account.id))
      .pipe(first())
      .subscribe({
        next: student => {
          this.student = student
        },
        error: err => {
          console.error('Failed fetching student information: ', err)
        }
      })
  }
} 