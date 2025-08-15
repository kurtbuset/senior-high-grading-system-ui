import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";

@Component({ 
  selector: 'student-layout', 
  templateUrl: 'layout.component.html',
  standalone: true,
  imports: [RouterModule] 
})
export class LayoutComponent {}