import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AlertService } from '@app/_services/alert.service';
import { GradingService } from '@app/_services/grading.service';
import { Title } from '@angular/platform-browser';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { first } from 'rxjs';

@Component({
  templateUrl: 'assessment-type.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class AssessmentTypeComponent implements OnInit {
  teacher_subject_id: string;
  quarter: string;
  type: string;

  editingQuizId = null;

  form: FormGroup;

  loading = false;
  submitted = false;

  quizForms: { [key: number]: FormGroup } = {};

  values: Object;

  quizzes: any;
  constructor(
    private route: ActivatedRoute,
    private gradingService: GradingService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private titleService: Title
  ) {
    this.route.parent?.paramMap.subscribe((params) => {
      this.teacher_subject_id = params.get('id')!;
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.quarter = params.get('quarter')!;
      this.type = params.get('type')!;

      // You can now use them to fetch quizzes or show on UI
      const pageTitle = `${this.quarter} - ${this.type}`;
      this.titleService.setTitle(pageTitle);

      this.values = {
        quarter: this.quarter,
        type: this.type,
      };
      this.loadQuizzes();
      console.log(this.type)
    });

    this.form = this.formBuilder.group({
      hps: ['', [Validators.required, Validators.min(1)]],
      description: ['', Validators.maxLength(255)],
    });
  }

  loadQuizzes() {
    this.gradingService
      .getQuizzes(this.teacher_subject_id, this.values)
      .subscribe({
        next: (quizzes) => {
          this.quizzes = quizzes;
          for (let quiz of quizzes) {
            this.quizForms[quiz.id] = this.formBuilder.group({
              hps: new FormControl(quiz.hps),
              description: new FormControl(quiz.description),
            });
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  onEdit(quiz: any) {
    // flag variable
    this.editingQuizId = quiz.id;

    console.log('edit mode');
  }

  updateQuiz(quiz: any) {
    const updatedValues = this.quizForms[quiz.id].value;

    const data = {
      description: updatedValues.description,
      hps: updatedValues.hps,
    };

    console.log(data);

    this.gradingService
      .updateQuiz(quiz.id, data)
      .pipe(first())
      .subscribe({
        next: (_) => {
          quiz.hps = updatedValues.hps;
          quiz.description = updatedValues.description;
          this.alertService.success('sucessfully update');
          this.editingQuizId = null;
        },
        error: (err) => {
          console.log('update failed: ', err);
          this.alertService.error(err);
        },
      });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    if (this.form.invalid) {
      return;
    }

    this.loading = true;

    const payload = {
      ...this.form.value,
      ...this.values,
      teacher_subject_id: this.teacher_subject_id,
    };

    console.log(payload);

    this.gradingService
      .addQuiz(payload)
      .pipe(first())
      .subscribe({
        next: () => {
          this.form.reset();
          this.alertService.success('quiz added succesfully');
          this.submitted = false;
          this.loading = false;
          this.loadQuizzes();
        },
        error: (err) => {
          this.alertService.error(err);
          this.loading = false;
        },
      });
  }
}
