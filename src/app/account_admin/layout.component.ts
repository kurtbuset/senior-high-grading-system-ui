import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'account-admin-layout',
  standalone: true,
  templateUrl: 'layout.component.html',
  imports: [RouterModule, CommonModule],
})
export class LayoutComponent {
}
