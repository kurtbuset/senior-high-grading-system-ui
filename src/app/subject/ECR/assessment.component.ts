import { Component, OnInit } from "@angular/core";
import { SubjectService } from "@app/_services/subject.service";
import { ActivatedRoute } from '@angular/router';

@Component({ templateUrl: 'assessment.component.html', standalone: true })
export class AssessmentComponent implements OnInit{
  subject = this.subjectService.subjectValue
  teacher_subject_id: string
  constructor(private subjectService: SubjectService, private route: ActivatedRoute,){}

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe(params => {
      this.teacher_subject_id = params.get('id')!;
      console.log(params)
      console.log('ID:', this.teacher_subject_id);
    });
  }
}