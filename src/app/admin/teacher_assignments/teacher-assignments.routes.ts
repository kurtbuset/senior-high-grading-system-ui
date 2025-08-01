import { Routes } from '@angular/router';

export const teacherAssignmentRoutes: Routes = [
  { path: '', loadComponent: () => import('./list.component').then(m => m.ListComponent) },
];
