import { Component, OnInit } from "@angular/core";
import { SubjectService } from '@app/_services/subject.service';
import { AccountService } from '@app/_services/account.service';
import { first } from "rxjs";
import { ActivatedRoute } from '@angular/router';
import { Subject } from "@app/_models/Subject";
import { CommonModule } from "@angular/common";

@Component({ templateUrl: 'grading-summary.component.html', standalone: true, imports: [CommonModule] })
export class GradingSummaryComponent implements OnInit {

  // subject: Subject
  subject$ = this.subjectService.subject;
  id: string
  constructor(  
    private route: ActivatedRoute,
    private subjectService: SubjectService
  ) {  }  

  ngOnInit(){
    this.id = this.route.snapshot.paramMap.get('id');
    console.log(this.id)
    this.subjectService
      .getOneSubject(Number(this.id))
      // .pipe(first)
      .subscribe(subject => {
        console.log(subject)
        this.subjectService.subjectSubject.next(subject)
      })
  }
}