import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AccountService } from "@app/_services/account.service";
import { AlertService } from "@app/_services/alert.service";

@Component({
  templateUrl: 'details.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DetailsComponent implements OnInit {
  account = this.accountService.accountValue;
  loading = false;

  // For Bootstrap modals (profile modify)
  isModifyModalOpen = false;

  constructor(
    private accountService: AccountService,
    private router: Router,
    private alertService: AlertService
  ){}

  ngOnInit() {
    this.loadUserSettings();
  }

  /** ===== New Profile Modify Modal Logic ===== */
  openModifyModal() {
    this.isModifyModalOpen = true;
  }

  closeModifyModal() {
    this.isModifyModalOpen = false;
  }

  saveChanges(event: Event) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const title = formData.get('title') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;

    if (!firstName || !lastName || !email) {
      this.alertService.error('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.alertService.error('Please enter a valid email address');
      return;
    }

    this.loading = true;
    this.alertService.clear();

    const updateData = {
      title: title || null,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase()
    };

    this.accountService.update(this.account.id, updateData)
      .subscribe({
        next: (response) => {
          const updatedAccount = { ...this.account, ...updateData };
          this.accountService.setMockAccount(updatedAccount);
          this.account = updatedAccount;
          this.alertService.success('Profile updated successfully');
          this.closeModifyModal();
          this.loading = false;
        },
        error: () => {
          this.updateProfileLocally(updateData);
          this.closeModifyModal();
        }
      });
  }

  resetPassword() {
    this.alertService.success('Password reset link sent to your email.');
  }

  deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      this.accountService.delete(this.account.id).subscribe(() => {
        this.alertService.success('Account deleted successfully');
        this.router.navigate(['/']);
      });
    }
  }

  /** ===== Old logic kept intact for settings/password/etc ===== */
  private updateProfileLocally(updateData: any) {
    try {
      const updatedAccount = { ...this.account, ...updateData };
      this.accountService.setMockAccount(updatedAccount);

      const localAccounts = JSON.parse(localStorage.getItem('localAccounts') || '[]');
      const accountIndex = localAccounts.findIndex((acc: any) => acc.id === this.account.id);

      if (accountIndex !== -1) {
        localAccounts[accountIndex] = { ...localAccounts[accountIndex], ...updateData };
        localStorage.setItem('localAccounts', JSON.stringify(localAccounts));
      }

      this.alertService.success('Profile updated locally');
    } catch (error) {
      this.alertService.error('Failed to update profile locally');
    }
  }

  onSettingsUpdate(event: any) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const emailNotifications = formData.get('emailNotifications') === 'on';
    const twoFactorAuth = formData.get('twoFactorAuth') === 'on';
    const profileVisibility = formData.get('profileVisibility') === 'on';

    this.loading = true;
    this.alertService.clear();

    const settingsData = {
      emailNotifications,
      twoFactorAuth,
      profileVisibility,
      lastUpdated: new Date().toISOString()
    };

    this.updateAccountSettings(settingsData);
  }

  private updateAccountSettings(settingsData: any) {
    setTimeout(() => {
      try {
        const userSettings = {
          userId: this.account.id,
          ...settingsData
        };

        localStorage.setItem(`userSettings_${this.account.id}`, JSON.stringify(userSettings));

        const localAccounts = JSON.parse(localStorage.getItem('localAccounts') || '[]');
        const accountIndex = localAccounts.findIndex((acc: any) => acc.id === this.account.id);

        if (accountIndex !== -1) {
          localAccounts[accountIndex].settings = settingsData;
          localStorage.setItem('localAccounts', JSON.stringify(localAccounts));
        }

        this.alertService.success('Settings updated successfully');
        this.loading = false;
      } catch {
        this.alertService.error('Failed to update settings.');
        this.loading = false;
      }
    }, 800);
  }

  private loadUserSettings() {
    try {
      const savedSettings = localStorage.getItem(`userSettings_${this.account.id}`);
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    return null;
  }
}
