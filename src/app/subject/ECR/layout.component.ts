import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule  } from '@angular/router';
import { SubnavComponent } from './subnav.component';
import { SubjectService } from '@app/_services/subject.service';
import { PercentagesComponent } from "./percentages.component";

@Component({ standalone: true, templateUrl: 'layout.component.html', imports: [RouterModule, SubnavComponent, PercentagesComponent] })
export class LayoutComponent implements OnInit{
  teacher_subject_id: string
  
  constructor(private route: ActivatedRoute, private subjectService: SubjectService){}

  ngOnInit(): void {
    // fetch the teacher_subject_id from url params and use it to fetch single subject to display from backend
    this.route.parent?.paramMap.subscribe((params) => {
      this.teacher_subject_id = params.get('id')!;
      // console.log(this.teacher_subject_id)
    });    
    
    this.subjectService
      .getOneSubject(Number(this.teacher_subject_id))
      .subscribe((subject) => {
        this.subjectService.subjectSubject.next(subject);
      });
  }
}