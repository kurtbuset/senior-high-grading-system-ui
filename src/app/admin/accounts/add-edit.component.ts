import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { first } from 'rxjs/operators';

import { AccountService } from '@app/_services/account.service';
import { AlertService } from '@app/_services/alert.service';
import { Account } from '@app/_models/account';
import { Role } from '@app/_models/role';
import { MustMatch } from '@app/_helpers/must-match.validator';

@Component({
  template: `
    <div class="container mt-4">
      <h2>{{ isAddMode ? 'Add New Account' : 'Edit Existing Account' }}</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="needs-validation" novalidate>
    

        <div class="form-group">
          <label for="firstName" class="form-label">First Name</label>
          <input type="text" id="firstName" formControlName="firstName" class="form-control" [ngClass]="{ 'is-invalid': submitted && f.firstName.errors }" required />
          <div *ngIf="submitted && f.firstName.errors" class="invalid-feedback">
            <div *ngIf="f.firstName.errors.required">First Name is required</div>
          </div>
        </div>

        <div class="form-group">
          <label for="lastName" class="form-label">Last Name</label>
          <input type="text" id="lastName" formControlName="lastName" class="form-control" [ngClass]="{ 'is-invalid': submitted && f.lastName.errors }" required />
          <div *ngIf="submitted && f.lastName.errors" class="invalid-feedback">
            <div *ngIf="f.lastName.errors.required">Last Name is required</div>
          </div>
        </div>

        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input type="email" id="email" formControlName="email" class="form-control" [ngClass]="{ 'is-invalid': submitted && f.email.errors }" required />
          <div *ngIf="submitted && f.email.errors" class="invalid-feedback">
            <div *ngIf="f.email.errors.required">Email is required</div>
            <div *ngIf="f.email.errors.email">Email must be a valid address</div>
          </div>
        </div>

        <div class="form-group">
          <label for="role" class="form-label">Role</label>
          <select id="role" formControlName="role" class="form-control" [ngClass]="{ 'is-invalid': submitted && f.role.errors }" required>
            <option value="">Select Role</option>
            <option [value]="Role.Admin">Admin</option>
            <option [value]="Role.Teacher">Teacher</option>
            <!-- Student removed -->
          </select>
          <div *ngIf="submitted && f.role.errors" class="invalid-feedback">
            <div *ngIf="f.role.errors.required">Role is required</div>
          </div>
        </div>

        <div class="form-group form-check">
          <input type="checkbox" id="isActive" formControlName="isActive" class="form-check-input" />
          <label class="form-check-label" for="isActive">Active</label>
        </div>

        <div *ngIf="isAddMode" class="form-group">
          <label for="password" class="form-label">Password</label>
          <input type="password" id="password" formControlName="password" class="form-control" [ngClass]="{ 'is-invalid': submitted && f.password.errors }" required />
          <div *ngIf="submitted && f.password.errors" class="invalid-feedback">
            <div *ngIf="f.password.errors.required">Password is required</div>
            <div *ngIf="f.password.errors.minlength">Password must be at least 6 characters</div>
          </div>
        </div>

        <div *ngIf="isAddMode" class="form-group">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <input type="password" id="confirmPassword" formControlName="confirmPassword" class="form-control" [ngClass]="{ 'is-invalid': submitted && f.confirmPassword.errors }" required />
          <div *ngIf="submitted && f.confirmPassword.errors" class="invalid-feedback">
            <div *ngIf="f.confirmPassword.errors.required">Confirm Password is required</div>
            <div *ngIf="form.errors?.mustMatch">Passwords must match</div>
          </div>
        </div>

        <button [disabled]="loading" class="btn btn-primary mt-3" type="submit">
          {{ isAddMode ? 'Create Account' : 'Update Account' }}
        </button>
        <a [routerLink]="['../']" class="btn btn-link mt-3 ml-2">Cancel</a>
      </form>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class AddEditComponent implements OnInit {
  form: UntypedFormGroup;
  id: string;
  isAddMode: boolean;
  loading = false;
  submitted = false;
  Role = Role;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.isAddMode = !this.id;

    this.form = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      isActive: [true],
      password: ['', this.isAddMode ? [Validators.required, Validators.minLength(6)] : []],
      confirmPassword: ['', this.isAddMode ? Validators.required : []]
    }, {
      validator: this.isAddMode ? MustMatch('password', 'confirmPassword') : null
    });

    if (!this.isAddMode) {
      this.accountService.getAccountById(this.id)
        .pipe(first())
        .subscribe(account => {
          this.form.patchValue({
            firstName: account.firstName,
            lastName: account.lastName,
            email: account.email,
            role: account.role,
            isActive: account.isActive
          });
        });
    }
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.alertService.clear();

    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    if (this.isAddMode) {
      this.createAccount();
    } else {
      this.updateAccount();
    }
  }

  private createAccount() {
    this.accountService.createAccount(this.form.value)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Account created successfully', { keepAfterRouteChange: true });
          // ensure loading flag reset before navigation
          this.loading = false;
          // navigate to accounts list (use absolute path to ensure correct route)
          this.router.navigate(['/admin/accounts']);
        },
        error: (error) => {
          this.alertService.error(error);
          this.loading = false;
        }
      });
  }

  private updateAccount() {
    const formData = { ...this.form.value };

    if (!formData.password) {
      delete formData.password;
      delete formData.confirmPassword;
    }

    this.accountService.updateAccount(this.id, formData)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Account updated successfully', { keepAfterRouteChange: true });
          this.loading = false;
          // navigate back to accounts list
          this.router.navigate(['/admin/accounts']);
        },
        error: (error) => {
          this.alertService.error(error);
          this.loading = false;
        }
      });
  }
}
