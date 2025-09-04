import { Routes } from '@angular/router';
import { authGuard } from './_helpers/auth.guard';

import { HomeComponent } from './home/home.component';

import { accountRoutes } from './account/account.routes';
import { teacherRoutes } from './teacher/subject.routes';
import { homeroomRoutes } from './homeroom/homeroom.routes';
import { superAdminRoutes } from './superadmin/superadmin.routes';
import { studentRoutes } from './student/student.routes';
import { Role } from './_models/role';

export const routes: Routes = [
  // redirect root to login if not authenticated, otherwise to home
  { path: '', redirectTo: '/account/login', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [authGuard], title: 'Home'}, 
  // lazily loaded
  { path: 'account', children: accountRoutes },
  { path: 'teacher', children: teacherRoutes, canActivate: [authGuard] },
  { path: 'superadmin', children: superAdminRoutes, canActivate: [authGuard], data: { roles: [Role.SuperAdmin] } },
  { path: 'student', children: studentRoutes, canActivate: [authGuard], data: { roles: [Role.Student] } },
  { path: 'homeroom', children: homeroomRoutes, canActivate: [authGuard], data: { roles: [Role.Registrar, Role.Principal] } },
  { path: '**', redirectTo: '' }, 
];
