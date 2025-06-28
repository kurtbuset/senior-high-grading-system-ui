import { Component } from "@angular/core";
import { RouterOutlet, Router } from "@angular/router";
import { AlertComponent } from "@app/_components/alert.component";
import { AccountService } from "@app/_services/account.service";

@Component({ templateUrl: 'layout.component.html', standalone: true, imports: [RouterOutlet]})
export class LayoutComponent{
  constructor(
    private router: Router,
    private accountService: AccountService
  ){
    if(this.accountService.accountValue){
      this.router.navigate(['/'])
    }
  }

  
}   