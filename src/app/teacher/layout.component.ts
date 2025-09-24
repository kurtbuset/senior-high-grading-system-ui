import { Component, OnInit } from '@angular/core';
import { RouterModule  } from '@angular/router';
import { SubjectInformationComponent } from './subject-information.component';

@Component({
  selector: 'subject-layout',
  standalone: true,
  templateUrl: 'layout.component.html',
  imports: [RouterModule, SubjectInformationComponent],
})
export class LayoutComponent{

}
