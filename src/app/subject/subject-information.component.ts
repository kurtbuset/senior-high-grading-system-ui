import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SubjectService } from '@app/_services/subject.service';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '@app/_services/account.service';

@Component({
  selector: 'subject-information',
  templateUrl: 'subject-information.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class SubjectInformationComponent implements OnInit {
  // auto assignment when someone is using .next()
  subject$ = this.subjectService.subject;

  teacher_subject_id: string;
  
  useCustomPercentage = false;

  constructor(
    private subjectService: SubjectService,
  ) {}

  ngOnInit() {
    // Component initialization logic here
  }
}
