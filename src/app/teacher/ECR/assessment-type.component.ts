import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AlertService } from '@app/_services/alert.service';
import { GradingService } from '@app/_services/grading.service';
import { Title } from '@angular/platform-browser';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { first, Subject, takeUntil } from 'rxjs';

@Component({
  templateUrl: 'assessment-type.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class AssessmentTypeComponent implements OnInit, OnDestroy {
  teacher_subject_id!: string;
  quarter!: string;
  type!: string;

  editingQuizId: number | null = null;

  form!: FormGroup;
  quizForms: Record<number, FormGroup> = {};

  quizzes: any[] = [];
  lockStatus: 'LOCKED' | 'PENDING' | 'UNLOCKED' | undefined;

  loading = false;
  submitted = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private gradingService: GradingService,
    private alertService: AlertService,
    private fb: FormBuilder,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    // Parent param for teacher_subject_id
    this.route.parent?.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.teacher_subject_id = params.get('id')!;
      });

    // Child params for quarter/type
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.quarter = params.get('quarter')!;
        this.type = params.get('type')!;

        this.titleService.setTitle(`${this.quarter} - ${this.type}`);

        this.initMainForm();
        this.loadQuizzes();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initMainForm() {
    this.form = this.fb.group({
      hps: ['', [Validators.required, Validators.min(1)]],
      description: ['', Validators.maxLength(255)],
    });
  }

  get isLockedOrPending(): boolean {
    return this.lockStatus === 'LOCKED' || this.lockStatus === 'PENDING';
  }

  private buildQuizForm(quiz: any): FormGroup {
    return this.fb.group({
      hps: [quiz.hps, [Validators.required, Validators.min(1)]],
      description: [quiz.description, Validators.maxLength(255)],
    });
  }

  loadQuizzes() {
    this.gradingService
      .getQuizzes(this.teacher_subject_id, {
        quarter: this.quarter,
        type: this.type,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.quizzes = result.quizzes;
          this.lockStatus = result.lockStatus;

          this.quizForms = {};
          for (let quiz of this.quizzes) {
            this.quizForms[quiz.id] = this.buildQuizForm(quiz);
          }
        },
        error: (error) => this.alertService.error(error),
      });
  }

  onEdit(quiz: any) {
    this.editingQuizId = quiz.id;
  }

  updateQuiz(quiz: any) {
    if (!this.quizForms[quiz.id].valid) return;

    const data = this.quizForms[quiz.id].value;

    this.gradingService
      .updateQuiz(quiz.id, data)
      .pipe(first())
      .subscribe({
        next: () => {
          Object.assign(quiz, data);
          this.alertService.success('Quiz updated successfully');
          this.editingQuizId = null;
        },
        error: (err) => this.alertService.error(err),
      });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.alertService.clear();

    if (this.form.invalid) return;

    this.loading = true;

    const payload = {
      ...this.form.value,
      quarter: this.quarter,
      type: this.type,
      teacher_subject_id: this.teacher_subject_id,
    };

    this.gradingService
      .addQuiz(payload)
      .pipe(first())
      .subscribe({
        next: () => {
          this.form.reset();
          this.alertService.success('Quiz added successfully');
          this.submitted = false;
          this.loadQuizzes();
        },
        error: (err) => this.alertService.error(err),
        complete: () => (this.loading = false),
      });
  }

  deleteQuiz(id: number) {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    const quiz = this.quizzes.find((q) => q.id === id);
    if (!quiz) return;

    quiz.isDeleting = true;

    this.gradingService
      .deleteQuiz(id)
      .pipe(first())
      .subscribe({
        next: () => {
          this.quizzes = this.quizzes.filter((q) => q.id !== id);
          this.alertService.success('Quiz deleted successfully');
        },
        error: (err) => this.alertService.error(err),
      });
  }
}
