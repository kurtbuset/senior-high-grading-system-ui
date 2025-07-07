import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, ActivatedRoute, NavigationEnd  } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SubnavComponent } from './subnav.component';

@Component({ standalone: true, templateUrl: 'layout.component.html', imports: [RouterModule, SubnavComponent] })
export class LayoutComponent{}