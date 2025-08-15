import { Component } from "@angular/core";
import { AccountService } from "@app/_services/account.service";
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  templateUrl: 'update-profile.component.html',
  standalone: true,
  imports: [FormsModule]
})
export class UpdateProfileComponent {
  account = this.accountService.accountValue;

  constructor(private accountService: AccountService, private router: Router) {}

  onSubmit() {
    this.accountService.updateAccount(this.account.id, {
      firstName: this.account.firstName,
      lastName: this.account.lastName,
      email: this.account.email
    }).subscribe({
      next: () => {
        // Update local account value
        this.accountService.updateLocalAccount({
          ...this.account,
          firstName: this.account.firstName,
          lastName: this.account.lastName,
          email: this.account.email
        });
        alert('Profile updated successfully!');
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        alert('Error updating profile: ' + err);
      }
    });
  }
}
