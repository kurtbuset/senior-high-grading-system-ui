    import { Component, OnInit } from '@angular/core';
    import { Router, ActivatedRoute, RouterModule } from '@angular/router';
    import {
      ReactiveFormsModule,
      FormBuilder,
      FormGroup,
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
    export class LoginComponent implements OnInit {
      form: FormGroup;
      loading = false;
      submitted = false;

      constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
      ) {}

      ngOnInit() {
        this.form = this.formBuilder.group({
          username: ['', [Validators.required]],
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
          return;
        }

        this.loading = true;
        
        // Use real backend authentication
        this.accountService
          .login(this.f.username.value, this.f.password.value)
          .pipe(first())
          .subscribe({
            next: () => {
              // get return url from query parameters or default to home page
              const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
              this.router.navigateByUrl(returnUrl);
            },
            error: (error) => {
              console.log(error);
              this.alertService.error(error);
              this.loading = false;
            },
          });
      }
    }
