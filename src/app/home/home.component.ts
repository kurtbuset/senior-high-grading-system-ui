import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '@app/_services/account.service';
import { Account } from '@app/_models/account';

@Component({ 
  templateUrl: 'home.component.html', 
  standalone: true,
  imports: [CommonModule]
})
export class HomeComponent implements OnInit {
  account: Account;

  constructor(private accountService: AccountService) {}

  ngOnInit() {
    // Subscribe to account changes
    this.accountService.account.subscribe(account => {
      this.account = account;
    });
  }
}
