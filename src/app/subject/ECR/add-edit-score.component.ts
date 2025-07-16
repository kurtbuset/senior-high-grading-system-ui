import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray } from '@angular/forms';
import { first } from 'rxjs';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { AlertService } from '@app/_services/alert.service';
import { GradingService } from '@app/_services/grading.service';

@Component({
  templateUrl: 'add-edit-score.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class AddEditScoreComponent implements OnInit {
  id: string;
  quarter: string;
  type: string;
  hps: number;
  teacher_subject_id: string;

  students: any;

  isAddMode: boolean;
  loading = false;
  submitted = false;

  form: UntypedFormGroup;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private alertService: AlertService,
    private gradingService: GradingService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // quiz id
    this.id = this.route.snapshot.paramMap.get('id')!;
    
    // quarter
    this.quarter = this.route.snapshot.paramMap.get('quarter')!;

    this.type = this.route.snapshot.paramMap.get('type')!;
    this.hps = +this.route.snapshot.queryParamMap.get('hps')!;
    this.teacher_subject_id = this.route.parent?.snapshot.paramMap.get('id')!;
    this.isAddMode = this.route.snapshot.url[2]?.path === 'add';

    const payLoad = {
      teacher_subject_id: this.teacher_subject_id,
      quiz_id: this.id
    }

    this.form = this.formBuilder.group({
      scores: this.formBuilder.array([])
    });

    console.log(this.form.controls)
    

    // get raw scores of students by quiz.id and enrollment_id
    if (this.isAddMode) {
      this.gradingService
      .getStudentsWithoutScore(payLoad)
      .pipe(first())
      .subscribe((students: any[]) => {
        console.log(students)
        this.students = students

        students.forEach(student => {
          this.scores.push(this.formBuilder.group({
            enrollment_id: [student.enrollment_id],
            raw_score: ['', [Validators.required, Validators.min(0), Validators.max(this.hps)]]
          }));
        });
      })
    }
    else{
      this.gradingService
        .getStudentsWithScore(Number(this.id))
        .pipe(first())
        .subscribe((students: any[]) => {
          console.log(students)
          this.students = students

           students.forEach(student => {
            this.scores.push(this.formBuilder.group({
              enrollment_id: [student.enrollment_id],
              raw_score: [student.raw_score, [Validators.required, Validators.min(0), Validators.max(this.hps)]]
            }));
          });
        })
    }
  }

  get scores() {
    return this.form.get('scores') as any; // FormArray
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      // when score is greater than hps 
      this.alertService.error(`Score must be required and should be less than ${this.hps}`)

      return;
    }
    
    const values = this.scores.value.map(score => ({
      quiz_id: Number(this.id),
      enrollment_id: score.enrollment_id,
      raw_score: score.raw_score  
    }));

    // console.log(values)

    this.loading = true;
    if (this.isAddMode) {
      this.addRawScores(values);
    } else {
      this.updateRawScores(values);
    }
  }

  // add scores
  private addRawScores(values) {
    // this.alertService.success('score added')
    this.gradingService 
      .addStudentScore(values)
      .pipe(first())
      .subscribe({
        next: _ => {
          this.router.navigate([`/subject/${this.teacher_subject_id}/${this.quarter}/${this.type}`])
          this.alertService.success('Scored added succesfully')
        }
      })
  }

  // update scores
  private updateRawScores(values) {
    console.log(values)
    this.gradingService
      .updateStudentScore(values)
      .pipe(first())
      .subscribe({
        next: _ => {
          this.router.navigate([`/subject/${this.teacher_subject_id}/${this.quarter}/${this.type}`])
          this.alertService.success('Scored updated succesfully')
        },
        error: err => {
          this.alertService.error(err)
          this.loading = false
        }
      })
  }
}
