import { Component } from "@angular/core";
import { AccountService } from "@app/_services/account.service";

@Component({ templateUrl: 'profile-details.component.html', standalone: true})
export class ProfileDetailsComponent{
  account = this.accountService.accountValue

  constructor(
    private accountService: AccountService
  ){}
}