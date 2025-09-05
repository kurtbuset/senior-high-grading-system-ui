import { Routes } from '@angular/router';
import { authGuard } from './_helpers/auth.guard';

import { HomeComponent } from './home/home.component';

import { accountRoutes } from './account/account.routes';
import { accountAdminRoutes } from './account_admin/account-admin.routes';
import { profileRoutes } from './profile/profile.routes';
import { subjectRoutes } from './subject/subject.routes';
import { adminRoutes } from './admin/admin.routes';
import { Role } from './_models/role';

export const routes: Routes = [
  // eagerly loaded component
  { path: '', component: HomeComponent, canActivate: [authGuard], title: 'Home'}, 
  // lazily loaded
  { path: 'account', children: accountRoutes },
  { path: 'account-admin', children: accountAdminRoutes, canActivate: [authGuard], data: { roles: [Role.SuperAdmin] } },
  { path: 'profile', children: profileRoutes, canActivate: [authGuard] },
  { path: 'subject', children: subjectRoutes, canActivate: [authGuard] },
  { path: 'admin', children: adminRoutes, canActivate: [authGuard], data: { roles: [Role.Admin] } },
  { path: '**', redirectTo: '' }, 
];
