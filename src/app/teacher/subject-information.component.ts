import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SubjectService } from '@app/_services/subject.service';
import { FormsModule } from '@angular/forms';
import { AccountService } from '@app/_services/account.service';


@Component({
  selector: 'subject-information',
  templateUrl: 'subject-information.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, CommonModule],
})
export class SubjectInformationComponent{
  // auto assignment when someone is using .next()
  subject$ = this.subjectService.subject;
  account = this.accountService.accountValue;
  teacher_subject_id: string;
  
  useCustomPercentage = false;

  constructor(
    private subjectService: SubjectService,
    private accountService: AccountService
  ) {}

}
