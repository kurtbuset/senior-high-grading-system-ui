import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Subject } from '@app/_models/Subject';
import { SubjectService } from '@app/_services/subject.service';
import { ActivatedRoute } from '@angular/router';
import { SubnavComponent } from './subnav.component';

@Component({
  selector: 'subject-information',
  templateUrl: 'subject-information.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class SubjectInformationComponent implements OnInit {
  subject$ = this.subjectService.subject;
  id: string;

  constructor(
    private subjectService: SubjectService,
    private route: ActivatedRoute
  ) {}
  

  ngOnInit(): void {
    // this.id = this.route.snapshot.paramMap.get('id');
    // console.log('subject info check: ', this.id)
  }
}
