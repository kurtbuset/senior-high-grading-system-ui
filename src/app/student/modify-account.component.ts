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
  templateUrl: 'modify-account.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class ModifyAccountComponent implements OnInit {
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

  getStudentNumber(): string {
    console.log('=== STUDENT NUMBER DEBUG ===');
    console.log('Account object:', this.account);
    console.log('Account school_id:', this.account?.school_id);
    console.log('Account email:', this.account?.email);
    
    // First priority: Check school_id from account object
    if (this.account?.school_id && this.account.school_id.match(/^\d{4}-\d{5}$/)) {
      console.log('Using school_id from account:', this.account.school_id);
      return this.account.school_id;
    }
    
    // Second priority: Check if email contains student ID format (YYYY-NNNNN)
    if (this.account?.email && this.account.email.match(/^\d{4}-\d{5}$/)) {
      console.log('Using email as student ID:', this.account.email);
      return this.account.email;
    }
    
    // Third priority: Check localStorage for the login username (student logged in with school_id)
    const loginData = localStorage.getItem('studentLoginId');
    console.log('localStorage studentLoginId:', loginData);
    if (loginData && loginData.match(/^\d{4}-\d{5}$/)) {
      console.log('Using studentLoginId from localStorage:', loginData);
      return loginData;
    }
    
    // Fourth priority: Try to extract from email if it contains the ID pattern anywhere
    if (this.account?.email) {
      const emailMatch = this.account.email.match(/\d{4}-\d{5}/);
      if (emailMatch) {
        console.log('Extracted student ID from email:', emailMatch[0]);
        return emailMatch[0];
      }
    }
    
    // Final fallback: Return default format
    console.log('Using fallback student ID: 2025-00001');
    console.log('=============================');
    return '2025-00001';
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
    
    console.log('=== PASSWORD UPDATE DEBUG INFO ===');
    console.log('Account ID:', accountId);
    console.log('Account email:', this.account?.email);
    console.log('Account school_id:', this.account?.school_id);
    console.log('Account role:', this.account?.role);
    console.log('Backend API URL:', `http://localhost:4000/accounts/${accountId}`);
    console.log('Update data (password hidden):', { password: '[HIDDEN]', confirmPassword: '[HIDDEN]' });
    console.log('JWT Token present:', !!this.account?.jwtToken);
    console.log('JWT Token preview:', this.account?.jwtToken?.substring(0, 20) + '...');
    console.log('===================================');
    
    // Update the password via backend API
    this.accountService
      .update(accountId, updateData)
      .pipe(first())
      .subscribe({
        next: (response) => {
          console.log('✅ Password update successful:', response);
          this.handleSuccessfulUpdate();
        },
        error: (error) => {
          console.error('❌ Password update error:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error
          });
          this.handleUpdateError(error);
        },
      });
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
    
    console.log('✅ Password update completed successfully. New password is now active.');
    
    // Force logout after successful password change to ensure they use new password
    setTimeout(() => {
      console.log('🔄 Forcing logout to ensure new password is used...');
      this.accountService.logout();
    }, 2000);
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