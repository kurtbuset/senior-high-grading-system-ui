import { Routes } from '@angular/router';
import { accountRoutes } from './accounts/accounts.routes';
import { subjectRoutes } from './subjects/subjects.routes';
import { teacherAssignmentRoutes } from './teacher_assignments/teacher-assignments.routes';

export const adminRoutes: Routes = [
  { path: '', loadComponent: () => import('./subnav.component').then(m => m.SubnavComponent), outlet: 'subnav' },
  { path: '', loadComponent: () => import('./layout.component').then(m => m.LayoutComponent), 
    children: [
      { path: 'accounts', children: accountRoutes },
      { path: 'subjects', children: subjectRoutes },
      { path: 'assignments', children: teacherAssignmentRoutes },
    ]
  }
];

