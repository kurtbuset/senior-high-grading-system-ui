import { Routes } from '@angular/router';
import { authGuard } from './_helpers/auth.guard';

import { HomeComponent } from './home/home.component';

import { accountRoutes } from './account/account.routes';
import { teacherRoutes } from './teacher/subject.routes';
import { homeroomRoutes } from './homeroom/homeroom.routes';
import { superAdminRoutes } from './superadmin/superadmin.routes';
import { studentRoutes } from './student/student.routes';
import { Role } from './_models/role';
import { curriculumSubjectRoutes } from './curriculum_subjects/curriculum-subject.routes';
import { profileRoutes } from './profile/profile.routes';

export const routes: Routes = [
  // redirect root to login if not authenticated, otherwise to home
   { path: '', component: HomeComponent, canActivate: [authGuard], title: 'Home'}, 
  // lazily loaded
  { path: 'account', children: accountRoutes },
  { path: 'profile', children: profileRoutes, canActivate: [authGuard] },
  { path: 'teacher', children: teacherRoutes, canActivate: [authGuard] },
  { path: 'teacher', children: teacherRoutes, canActivate: [authGuard] },
  { path: 'superadmin', children: superAdminRoutes, canActivate: [authGuard], data: { roles: [Role.SuperAdmin] } },
  { path: 'student', children: studentRoutes, canActivate: [authGuard], data: { roles: [Role.Student] } },
  { path: 'homeroom', children: homeroomRoutes, canActivate: [authGuard], data: { roles: [Role.Registrar, Role.Principal] } },
  { path: 'curriculum-subjects', children: curriculumSubjectRoutes, canActivate: [authGuard], data: { roles: [Role.Registrar] } },
  { path: 'logging-history', loadComponent: () => import('./logging_history/logging_history.component').then(m => m.LoggingHistoryComponent), canActivate: [authGuard], title: 'History Loggin' },
  { path: '**', redirectTo: '' }, 
];
