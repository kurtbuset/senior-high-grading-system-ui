import { Routes } from '@angular/router';
import { studentRoutes } from './student/student.routes';
import { adminRoutes } from './admin/admin.routes';
import { subjectRoutes } from './subject/subject.routes';

const routes: Routes = [
  { path: '', redirectTo: 'account/login', pathMatch: 'full' },

  // Auth
  { path: 'account/login', loadComponent: () => import('./account/login.component').then(m => m.LoginComponent) },

  // Admin
  {
    path: 'admin',
    children: adminRoutes
  },

  // Teacher
  {
    path: 'subject',
    children: subjectRoutes
  },

  // Student
  {
    path: 'student',
    children: studentRoutes
  },

  { path: '**', redirectTo: 'account/login' },
];

export default routes;
