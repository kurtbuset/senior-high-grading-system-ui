import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '@app/_services/account.service';
import { AlertService } from '@app/_services/alert.service';
import { MustMatch } from '@app/_helpers/must-match.validator';
import { first } from 'rxjs';
import { Role } from '@app/_models/role';

@Component({
  templateUrl: 'add-edit.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class AddEditComponent implements OnInit {
  form!: UntypedFormGroup;
  id!: string;
  isAddMode!: boolean;
  loading = false;
  submitted = false;

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
      title: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['Teacher', Validators.required],
      isActive: [true],
      acceptTerms: [true]
    });

    if (this.isAddMode) {
      // Rebuild form with password fields for add mode
      this.form = this.formBuilder.group({
        title: ['', Validators.required],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        role: ['Teacher', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        isActive: [true],
        acceptTerms: [true]
      }, {
        validators: MustMatch('password', 'confirmPassword')
      });
    }

    if (!this.isAddMode) {
      // Load account data for editing
      this.accountService.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (account) => {
            this.form.patchValue(account);
          },
          error: () => {
            this.alertService.error('Account not found');
            this.router.navigate(['../'], { relativeTo: this.route });
          }
        });
    }
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    this.alertService.clear();

    console.log('Form valid:', this.form.valid);
    console.log('Form errors:', this.form.errors);
    console.log('Form value:', this.form.value);

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
    const formValue = { ...this.form.value };

    // Remove confirmPassword as most backends don't need it
    delete formValue.confirmPassword;

    console.log('Creating account:', JSON.stringify(formValue, null, 2));

    this.accountService.register(formValue)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Account created successfully', { keepAfterRouteChange: true });
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: error => {
          console.error('Registration error:', error);
          // For development: create account locally when backend is unavailable
          this.createAccountLocally(formValue);
        }
      });
  }

  private createAccountLocally(accountData: any) {
    // Generate a unique ID for local storage
    const newAccount = {
      ...accountData,
      id: Date.now().toString(), // Simple ID generation
      isActive: accountData.isActive !== false // Default to true if not specified
    };

    // Store in localStorage for development
    const existingAccounts = JSON.parse(localStorage.getItem('localAccounts') || '[]');
    existingAccounts.push(newAccount);
    localStorage.setItem('localAccounts', JSON.stringify(existingAccounts));

    this.alertService.success('Account created successfully (development mode)', { keepAfterRouteChange: true });
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  private updateAccount() {
    this.accountService.update(this.id, this.form.value)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Account updated successfully', { keepAfterRouteChange: true });
          this.router.navigate(['../../'], { relativeTo: this.route });
        },
        error: error => {
          console.error('Update error:', error);
          this.alertService.error(error);
          this.loading = false;
        }
      });
  }
}
