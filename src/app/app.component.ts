import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { Role } from './_models/role';
import { Account } from './_models/account';

import { AccountService } from './_services/account.service';
import { SubjectService } from './_services/subject.service';
import { CommonModule } from '@angular/common';
import { AlertComponent } from './_components/alert.component';
import { BreadcrumbNavComponent } from "./subject/breadcrumb-nav.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AlertComponent, RouterModule, BreadcrumbNavComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  account: Account;
  showLogoutModal = false;
  loggingOut = false;
  Role = Role; // Make Role enum available in template

  constructor(
    private accountService: AccountService,
    private subjectService: SubjectService,
    private router: Router
  ) {
    // Subscribe to account changes
    this.accountService.account.subscribe((x) => {
      this.account = x;
      console.log('App Component: Account updated:', x);
      
      // If no account and not on login page, redirect to login
      if (!x && this.router.url !== '/account/login' && this.router.url !== '/account/register') {
        this.router.navigate(['/account/login']);
      }
    });
  }

  ngOnInit() {
    // No forced logout on app start. App will show login if not authenticated.
  }

  openLogoutModal() {
    this.showLogoutModal = true;
  }

  closeLogoutModal() {
    this.showLogoutModal = false;
  }

  logout() {
    console.log('App Component: Starting logout...');
    this.loggingOut = true;
    this.showLogoutModal = false;
    
    // Use the account service logout method which handles everything
    this.accountService.logout();
    
    // Reset the logging out state
    this.loggingOut = false;
  }
}
