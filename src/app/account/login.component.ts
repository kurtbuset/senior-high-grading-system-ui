import { Component } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService } from '@app/_services/account.service';
import { AlertService } from '@app/_services/alert.service';
import { CommonModule } from '@angular/common';

@Component({
  templateUrl: 'login.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class LoginComponent {
  form: UntypedFormGroup;
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
    this.form = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
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
      console.log('Form is invalid:', this.form.errors);
      return;
    }

    this.loading = true;
    const email = this.f.email.value;
    const password = this.f.password.value;
    
    console.log('Attempting login with email:', email);
    
    this.accountService
      .login(email, password)
      .pipe(first())
      .subscribe({
        next: () => {
          console.log('Login successful');
          // get return url from query parameters or default to home page
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
          console.log('Redirecting to:', returnUrl);
          this.router.navigateByUrl(returnUrl);
        },
        error: (error) => {
          console.error('Login error details:', error);
          
          // Extract error message based on response structure
          let errorMessage = 'Login failed. Please try again.';
          
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          } else if (error && typeof error === 'object') {
            if (error.status === 0) {
              errorMessage = 'Unable to connect to the server. Please ensure the backend is running at http://localhost:4000';
            } else if (error.status === 401) {
              errorMessage = 'Invalid email or password';
            } else if (error.error && typeof error.error === 'string') {
              errorMessage = error.error;
            } else if (error.message) {
              errorMessage = error.message;
            }
          }
          
          console.error('Displaying error to user:', errorMessage);
          this.alertService.error(errorMessage);
          this.loading = false;
        },
      });
  }
}
