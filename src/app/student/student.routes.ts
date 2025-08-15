import { Routes } from '@angular/router';

import { LayoutComponent } from './layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MyProfileComponent } from './my-profile/student-profile.component';
import { ModifyAccountComponent } from './modify-account/modify-account.component';
import { EGradeComponent } from './e-grade/e-grade.component';

export const studentRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'e-grade', component: EGradeComponent },
      { path: 'my-profile', component: MyProfileComponent },
      { path: 'modify-account', component: ModifyAccountComponent },
    ]
  }
];