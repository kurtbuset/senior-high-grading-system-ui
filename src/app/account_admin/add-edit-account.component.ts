import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
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
    private location: Location,
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
            this.alertService.error('Failed to load account: ' + error);
            console.error('Failed to load account:', error);
            this.loading = false;
            // Navigate back to account list on error
            this.cancel();
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
    
    // Create a clean object with only the fields we want to send
    const formValue = this.form.value;
    const accountData: any = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      role: formValue.role,
      isActive: formValue.isActive
    };

    // Only include password fields if they have values
    if (formValue.password && formValue.password.length > 0) {
      accountData.password = formValue.password;
      accountData.confirmPassword = formValue.confirmPassword;
    }

    if (this.id) {
      this.updateAccount(accountData);
    } else {
      this.createAccount(accountData);
    }
  }

  private createAccount(account: Account) {
    this.accountService.createAccount(account)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Account created successfully', { keepAfterRouteChange: true });
          this.cancel();
        },
        error: (error) => {
          this.alertService.error('Failed to create account: ' + error);
          console.error('Failed to create account:', error);
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
          this.cancel();
        },
        error: (error) => {
          console.error('Failed to update account:', error);
          console.error('Account data being sent:', account);
          this.alertService.error('Failed to update account: ' + error);
          this.submitting = false;
        }
      });
  }

  cancel() {
    // Go back to the previous page in the browser history
    this.location.back();
  }
}
