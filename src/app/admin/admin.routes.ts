import { Routes } from '@angular/router';
import { accountRoutes } from './accounts/accounts.routes';
import { subjectRoutes } from './subjects/subjects.routes';
import { teacherAssignmentRoutes } from './teacher_assignments/teacher-assignments.routes';

export const adminRoutes: Routes = [
  { path: '', loadComponent: () => import('./layout.component').then(m => m.LayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'accounts', children: accountRoutes },
      { path: 'subjects', children: subjectRoutes },
      { path: 'assignments', children: teacherAssignmentRoutes },
    ]
  }
];

