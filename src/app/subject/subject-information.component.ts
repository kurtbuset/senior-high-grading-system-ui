import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SubjectService } from '@app/_services/subject.service';
import { ActivatedRoute } from '@angular/router';
import { FormsModule,  UntypedFormBuilder,
  UntypedFormGroup,
  Validators, } from '@angular/forms';
import { AccountService } from '@app/_services/account.service';


@Component({
  selector: 'subject-information',
  templateUrl: 'subject-information.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, CommonModule],
})
export class SubjectInformationComponen implements OnInit {
  // auto assignment when someone is using .next()
  subject$: any;


  teacher_subject_id: string;
  
  useCustomPercentage = false;

  constructor(
    private subjectService: SubjectService,
  ) {}
  
  ngOnInit() {
    this.subject$ = this.subjectService.subject;
  }

}
