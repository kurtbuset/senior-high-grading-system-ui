import { Component } from "@angular/core";
import { RouterOutlet, RouterModule } from "@angular/router";

@Component({ selector: 'profile', templateUrl: 'layout.component.html', standalone: true, imports: [RouterOutlet, RouterModule]})
export class LayoutComponent{
  constructor(){
  }
}