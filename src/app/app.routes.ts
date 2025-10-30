import { Routes } from '@angular/router';
import { authGuard } from './_helpers/auth.guard';

import { HomeComponent } from './home/home.component';

import { accountRoutes } from './account/account.routes';
import { profileRoutes } from './profile/profile.routes';
import { teacherRoutes } from './teacher/subject.routes';
import { homeroomRoutes } from './homeroom/homeroom.routes';
import { Role } from './_models/role';
import { curriculumSubjectRoutes } from './curriculum_subjects/curriculum-subject.routes';
import { accountsCrudRoutes } from './superadmin/accounts/accounts-crud.routes';
import { studentsCrudRoutes } from './registrar/students/students-crud.routes';

export const routes: Routes = [
  // eagerly loaded component 
  { path: '', component: HomeComponent, canActivate: [authGuard], title: 'Home'}, 
  // lazily loaded
  { path: 'account', children: accountRoutes },
  { path: 'profile', children: profileRoutes, canActivate: [authGuard] },
  { path: 'teacher', children: teacherRoutes, canActivate: [authGuard] },
  { path: 'egrade', loadComponent: () => import('./student/egrade.component').then(m => m.EgradeComponent), canActivate: [authGuard], data: { roles: [Role.Student] }, title: 'E-Grade' },
  { path: 'homeroom', children: homeroomRoutes, canActivate: [authGuard], data: { roles: [Role.Registrar, Role.Principal, Role.Teacher] } },
  { path: 'curriculum-subjects', children: curriculumSubjectRoutes, canActivate: [authGuard], data: { roles: [Role.Principal, Role.Registrar] } },
  { path: 'students-list', children: studentsCrudRoutes, canActivate: [authGuard], data: { roles: [Role.Registrar] } },
  { path: 'accounts', children: accountsCrudRoutes, canActivate: [authGuard], data: { roles: [Role.SuperAdmin]} },
  { path: '**', redirectTo: '' }, 
];
  