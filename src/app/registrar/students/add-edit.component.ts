import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { AlertService } from '@app/_services/alert.service';
import { MustMatch } from '@app/_helpers/must-match.validator';
import { AccountService } from '@app/_services/account.service';
import { RouterModule } from '@angular/router';

@Component({
  templateUrl: 'add-edit.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class AddEditComponent implements OnInit {
  isAddMode: boolean;
  loading = false;
  submitted = false;
  submitting = false;

  form: UntypedFormGroup;
  id?: string;
  title!: string;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private alertService: AlertService,
    private router: Router,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    console.log(this.id)
    this.form = this.formBuilder.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        role: ['', Validators.required],
        isActive: [true],
        // password only required in add mode
        password: [
          '',
          [Validators.minLength(6), ...(!this.id ? [Validators.required] : [])],
        ],
        confirmPassword: [''],
      },
      {
        validator: MustMatch('password', 'confirmPassword'),
      }
    );
    this.title = 'Create Account';

    if (this.id) {
      // edit mode
      this.title = 'Edit Account';
      this.loading = true;
      this.accountService
        .getById(this.id)
        .pipe(first())
        .subscribe((x) => {
          this.form.patchValue(x);
          this.loading = false;
        });
    }
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
      return;
    }

    this.submitting = true;

    // create or update account based on id param
    let saveAccount;
    let message: string;
    if (this.id) {
      saveAccount = () => this.accountService.update(this.id!, this.form.value);
      message = 'Account updated';
    } else {
      saveAccount = () => this.accountService.create(this.form.value);
      message = 'Account created';
    }

    saveAccount()
      .pipe(first())
      .subscribe({
        next: () => {
          console.log('success!');
          this.alertService.success(message, { keepAfterRouteChange: true });
          this.router.navigateByUrl('/accounts');
        },
        error: (error) => {
          this.alertService.error(error);
          this.submitting = false;
        },
      });
  }
}
