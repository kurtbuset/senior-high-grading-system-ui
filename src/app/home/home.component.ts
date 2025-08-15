import { Component, OnInit } from '@angular/core';
import { AccountService } from '@app/_services/account.service';
import { RouterModule } from '@angular/router';

@Component({
  templateUrl: 'home.component.html',
  standalone: true,
  imports: [RouterModule]
})
export class HomeComponent {
  account = this.accountService.accountValue;

  constructor(private accountService: AccountService) {}
}
