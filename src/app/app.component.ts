import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Role } from './_models/role';
import { Account } from './_models/account';

import { AccountService } from './_services/account.service';
import { SubjectService } from './_services/subject.service';
import { CommonModule } from '@angular/common';
import { AlertComponent } from './_components/alert.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AlertComponent, RouterModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  Role = Role;
  account: Account;
  showLogoutModal = false;
  

  constructor(
    private accountService: AccountService,
    private subjectService: SubjectService
  ) {
    accountService.account.subscribe((x) => (this.account = x));
  }

  openLogoutModal() {
    this.showLogoutModal = true;
  }

  closeLogoutModal() {
    this.showLogoutModal = false;
  }

  logout() {
    this.showLogoutModal = false;
    this.accountService.logout();
    this.subjectService.eraseSubjects();
    
  }
}
