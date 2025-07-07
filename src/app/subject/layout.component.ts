import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, ActivatedRoute, NavigationEnd  } from '@angular/router';
import { SubjectInformationComponent } from './ECR/subject-information.component';
import { CommonModule } from '@angular/common';
import { SubnavComponent } from "./ECR/subnav.component";


@Component({
  selector: 'subject-layout',
  standalone: true,
  templateUrl: 'layout.component.html',
  imports: [RouterModule, SubjectInformationComponent, CommonModule],
})
export class LayoutComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
  }
}
