import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SubjectService } from '@app/_services/subject.service';
import { ActivatedRoute } from '@angular/router';
import { FormsModule,  UntypedFormBuilder,
  UntypedFormGroup,
  Validators, } from '@angular/forms';


@Component({
  selector: 'subject-information',
  templateUrl: 'subject-information.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, CommonModule],
})
export class SubjectInformationComponen{
  // auto assignment when someone is using .next()
  subject$ = this.subjectService.subject;

  teacher_subject_id: string;
  
  useCustomPercentage = false;

  constructor(
    private subjectService: SubjectService
  ) {}

}
