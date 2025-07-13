import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { SubjectService } from '@app/_services/subject.service';
import { AlertService } from '@app/_services/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GradingService } from '@app/_services/grading.service';
import { first } from 'rxjs';

@Component({
  selector: 'percentages',
  templateUrl: 'percentages.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class PercentagesComponent {
  teacher_subject_id: string;
  subject$ = this.subjectService.subject;
  form: UntypedFormGroup;
  isEditing = false;
  loading = false;
  submitted = false;

  constructor(
    private subjectService: SubjectService,
    private formBuilder: UntypedFormBuilder,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private gradingService: GradingService,
    private router: Router
  ) {}

  startEditing(subject: any) {
    this.form = this.formBuilder.group({
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
    this.loading = false;
    this.isEditing = true;
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.route.parent?.paramMap.subscribe((params) => {
      this.teacher_subject_id = params.get('id')!;
    });
    
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }


    this.loading = true;

    this.gradingService
      .updatePercentages(this.teacher_subject_id, this.form.value)
      .pipe(first())
      .subscribe({
        next: () => {
          this.isEditing = false;
          this.router
            .navigateByUrl('/', { skipLocationChange: true })
            .then(() => {
              this.router.navigate([`/subject/${this.teacher_subject_id}`]);
              this.alertService.success('percentages successfully updated boii');
            });
          
        },
        error: (error) => {
          this.alertService.error(error);
          this.loading = false;
        },
      });
  }

  cancelEdit() {
    this.isEditing = false;
  }
}
