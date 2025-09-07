import { Component, OnInit } from '@angular/core';
import { AccountService } from '@app/_services/account.service';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({ templateUrl: 'home.component.html', standalone: true, imports: [CommonModule, RouterModule] })
export class HomeComponent {
  account = this.accountService.accountValue;

  constructor(private accountService: AccountService) {}
}
