import { Component, OnInit } from '@angular/core';
import { AccountService } from '@app/_services/account.service';
import { RouterModule } from '@angular/router';

@Component({
  templateUrl: 'home.component.html',
  standalone: true,
  imports: [RouterModule]
})
export class HomeComponent implements OnInit {
  account: any;

  constructor(private accountService: AccountService) {}
  
  ngOnInit() {
    this.account = this.accountService.accountValue;
  }
}
