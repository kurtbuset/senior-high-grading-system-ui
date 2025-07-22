import { Component } from "@angular/core";
import { AccountService } from "@app/_services/account.service";

@Component({ templateUrl: 'details.component.html', standalone: true})
export class DetailsComponent{
  account = this.accountService.accountValue

  constructor(
    private accountService: AccountService
  ){}
}