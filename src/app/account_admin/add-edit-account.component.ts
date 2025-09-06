import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '@app/_services/account.service';
import { AlertService } from '@app/_services/alert.service';
import { Account } from '@app/_models/account';
import { Role } from '@app/_models/role';
import { first } from 'rxjs/operators';
import { MustMatch } from '@app/_helpers/must-match.validator';

@Component({
  selector: 'add-edit-account',
  standalone: true,
  templateUrl: 'add-edit-account.component.html',
  imports: [CommonModule, ReactiveFormsModule],
})
export class AddEditAccountComponent implements OnInit {
  form!: FormGroup;
  id?: string;
  title!: string;
  loading = false;
  submitting = false;
  submitted = false;
  Role = Role;
  roles = Object.values(Role);

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.title = this.id ? 'Edit Account' : 'Add Account';

    this.form = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      isActive: [true],
      lrn_number: [''],
      school_year: [''],
      password: ['', this.id ? [] : [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['']
    }, {
      validator: this.id ? null : MustMatch('password', 'confirmPassword')
    });

    if (this.id) {
      this.title = 'Edit Account';
      this.loading = true;
      this.accountService.getAccountById(this.id)
        .pipe(first())
        .subscribe({
          next: (account) => {
            this.form.patchValue(account);
            this.loading = false;
          },
          error: (error) => {
            this.alertService.error('Failed to load account');
            this.loading = false;
          }
        });
    }
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    this.alertService.clear();

    if (this.form.invalid) {
      return;
    }

    this.submitting = true;
    const account = this.form.value;
    
    if (this.id) {
      this.updateAccount(account);
    } else {
      this.createAccount(account);
    }
  }

  private createAccount(account: Account) {
    this.accountService.createAccount(account)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Account created successfully', { keepAfterRouteChange: true });
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: (error) => {
          this.alertService.error(error);
          this.submitting = false;
        }
      });
  }

  private updateAccount(account: Partial<Account>) {
    this.accountService.updateAccount(this.id!, account)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Account updated successfully', { keepAfterRouteChange: true });
          this.router.navigate(['../../'], { relativeTo: this.route });
        },
        error: (error) => {
          this.alertService.error(error);
          this.submitting = false;
        }
      });
  }
}
