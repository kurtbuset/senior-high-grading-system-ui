import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { SubjectService } from '@app/_services/subject.service';

@Component({
  selector: 'percentages',
  templateUrl: 'percentages.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class PercentagesComponent {
  subject$ = this.subjectService.subject;
  form!: UntypedFormGroup;
  isEditing = false;

  constructor(
    private subjectService: SubjectService,
    private fb: UntypedFormBuilder
  ) {}

  startEditing(subject: any) {
    this.form = this.fb.group({
      custom_ww_percent: [
        subject.custom_ww_percent,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      custom_pt_percent: [
        subject.custom_pt_percent,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      custom_qa_percent: [
        subject.custom_qa_percent,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
    });
    this.isEditing = true;
  }

  saveChanges() {
    if (this.form.valid) {
      const updated = this.form.value;  
      console.log('Saving: ', updated); 
      
      // TODO: Optionally call API to persist changes
      this.subjectService.subjectSubject.next({
        ...this.subjectService.subjectValue,
        ...updated,
      });

      this.isEditing = false;
    }
  }

  cancelEdit() {
    this.isEditing = false;
  }
}
