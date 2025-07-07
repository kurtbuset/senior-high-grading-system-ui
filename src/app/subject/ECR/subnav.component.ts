import { Component, Input } from "@angular/core";
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from "@angular/router";
import { SubjectService } from "@app/_services/subject.service";

@Component({ selector: 'subnav', standalone: true, templateUrl: 'subnav.component.html', imports: [RouterModule]})
export class SubnavComponent{
  
  id: string
  constructor(private route: ActivatedRoute, private subjectService: SubjectService) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    console.log('current teacher_subject_id: ', this.id)
    this.subjectService.getOneSubject(Number(this.id)).subscribe((subject) => {
      this.subjectService.subjectSubject.next(subject);
    });
  }
}