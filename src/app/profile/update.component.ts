import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { first } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import { AccountService } from '@app/_services/account.service';
import { AlertService } from '@app/_services/alert.service';

// Custom validator for password matching
function MustMatch(controlName: string, matchingControlName: string) {
  return (formGroup: AbstractControl) => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);

    if (!control || !matchingControl) {
      return null;
    }

    // return null if controls don't exist or if control value is empty
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null);
    }
    return null;
  };
}

@Component({
  templateUrl: 'update.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class UpdateComponent implements OnInit {
  account = this.accountService.accountValue;
  form!: FormGroup;
  loading = false;
  submitted = false;
  passwordChanged = false;
  showSuccessAlert = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, {
      validators: MustMatch('password', 'confirmPassword')
    });
  }

  get f() {
    return this.form.controls;
  }

  closeSuccessAlert() {
    this.showSuccessAlert = false;
  }

  goToLogin() {
    // Logout user to ensure they must use new password
    this.accountService.logout();
  }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      console.log('Form is invalid:', this.form.errors);
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control && control.invalid) {
          console.log(`Field ${key} is invalid:`, control.errors);
        }
      });
      return;
    }

    this.loading = true;
    
    // Get account ID
    const accountId = this.account?.id;
    
    if (!accountId) {
      this.alertService.error('Account ID not found. Please try logging out and logging back in.');
      this.loading = false;
      return;
    }
    
    // Prepare update data - ensure both password and confirmPassword are sent for backend validation
    const updateData = {
      password: this.form.value.password,
      confirmPassword: this.form.value.confirmPassword
    };
    
    console.log('Updating password for account ID:', accountId);
    console.log('Account email:', this.account?.email);
    console.log('Sending password update request to backend...');
    
    // Update the password via backend API
    // this.accountService
    //   .update(accountId, updateData)
    //   .pipe(first())
    //   .subscribe({
    //     next: (response) => {
    //       console.log('Password update successful:', response);
    //       this.handleSuccessfulUpdate();
    //     },
    //     error: (error) => {
    //       console.error('Password update error:', error);
    //       this.handleUpdateError(error);
    //     },
    //   });
  }
  
  private handleSuccessfulUpdate() {
    this.loading = false;
    this.passwordChanged = true;
    this.showSuccessAlert = true;
    
    // Clear form after successful update
    this.form.reset();
    this.submitted = false;
    
    // Display success message that confirms the new password is active
    this.alertService.success('Password changed successfully! You can now use your new password to login to the system.', { keepAfterRouteChange: true });
    
    console.log('Password update completed successfully. New password is now active.');
    
    // Keep success alert visible until user manually goes to login
  }
  
  private handleUpdateError(error: any) {
    console.error('Password update failed:', error);
    
    let errorMessage = 'Failed to update password.';
    
    if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error?.error) {
      errorMessage = `Password update failed: ${error.error}`;
    } else if (error?.status) {
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid password format. Please check your password requirements.';
          break;
        case 401:
          errorMessage = 'Authentication failed. Please login again.';
          break;
        case 403:
          errorMessage = 'You do not have permission to change this password.';
          break;
        case 404:
          errorMessage = 'Account not found. Please try logging out and logging back in.';
          break;
        case 500:
          errorMessage = 'Server error occurred. Please try again later.';
          break;
        default:
          errorMessage = `Password update failed with status ${error.status}.`;
      }
    }
    
    this.alertService.error(errorMessage);
    this.loading = false;
  }
}