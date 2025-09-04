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
          console.log('Login error:', error);
          this.alertService.error(error);
          this.loading = false;
        },
      });
  }
}
