import { Component, OnInit } from "@angular/core";
import { AccountService } from "@app/_services/account.service";

@Component({ templateUrl: 'details.component.html', standalone: true})
export class DetailsComponent implements OnInit {
  account: any;

  constructor(
    private accountService: AccountService
  ){}
  
  ngOnInit() {
    this.account = this.accountService.accountValue;
  }
}