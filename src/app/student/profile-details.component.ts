import { Component } from "@angular/core";
import { AccountService } from "@app/_services/account.service";

@Component({ templateUrl: 'profile-details.component.html', standalone: true})
export class ProfileDetailsComponent{
  account = this.accountService.accountValue

  constructor(
    private accountService: AccountService
  ){}

  getStudentNumber(): string {
    // First priority: Check school_id from account object
    if (this.account?.school_id && this.account.school_id.match(/^\d{4}-\d{5}$/)) {
      return this.account.school_id;
    }
    
    // Second priority: Check if email contains student ID format (YYYY-NNNNN)
    if (this.account?.email && this.account.email.match(/^\d{4}-\d{5}$/)) {
      return this.account.email;
    }
    
    // Third priority: Check localStorage for the login username (student logged in with school_id)
    const loginData = localStorage.getItem('studentLoginId');
    if (loginData && loginData.match(/^\d{4}-\d{5}$/)) {
      return loginData;
    }
    
    // Fourth priority: Try to extract from email if it contains the ID pattern anywhere
    if (this.account?.email) {
      const emailMatch = this.account.email.match(/\d{4}-\d{5}/);
      if (emailMatch) {
        return emailMatch[0];
      }
    }
    
    // Final fallback: Return default format
    return '2025-00001';
  }
}