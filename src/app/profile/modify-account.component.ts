// modify-account.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AccountService } from '@app/_services/account.service';
import { CommonModule } from '@angular/common';
import { MustMatch } from '@app/_helpers/must-match.validator'; // <-- import here
import { AlertService } from '@app/_services/alert.service';

@Component({
  templateUrl: 'modify-account.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ModifyAccountComponent {
  form: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  account = this.accountService.accountValue;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private alertService: AlertService
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: MustMatch('password', 'confirmPassword') // <-- use MustMatch here
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.accountService.changePassword(Number(this.account.id), this.form.value).subscribe({
      next: () => {
        this.successMessage = 'Password updated successfully!';
        this.alertService.success(this.successMessage)
        this.errorMessage = '';
        this.loading = false;
        this.form.reset();
      },
      error: err => {
        this.errorMessage = err.error?.message || 'Failed to update password';
        this.successMessage = '';
        this.loading = false;
      }
    });
  }
}
