import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({ selector: 'profile', templateUrl: 'layout.component.html', standalone: true, imports: [RouterOutlet]})
export class LayoutComponent{
  constructor(){
  }
} 