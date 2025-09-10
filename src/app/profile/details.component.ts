import { Component } from "@angular/core";
import { AccountService } from "@app/_services/account.service";

@Component({ templateUrl: 'details.component.html', standalone: true})
export class DetailsComponent{
  account = this.accountService.accountValue

  constructor(
    private accountService: AccountService
  ){}

  getStudentNumber(): string {
    // First try school_id from account object
    if (this.account?.school_id) {
      return this.account.school_id;
    }
    
    // Check if email contains student ID format (YYYY-NNNNN)
    if (this.account?.email && this.account.email.match(/^\d{4}-\d{5}$/)) {
      return this.account.email;
    }
    
    // Check localStorage for the login username (student might have logged in with school_id)
    const loginData = localStorage.getItem('studentLoginId');
    if (loginData && loginData.match(/^\d{4}-\d{5}$/)) {
      return loginData;
    }
    
    // Fallback to email or default
    return this.account?.email || '2025-00001';
  }
}