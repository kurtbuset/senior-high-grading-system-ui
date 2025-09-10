import { Routes } from '@angular/router';

export const superAdminRoutes: Routes = [
  { path: '', loadComponent: () => import('./dashboard.component').then(m => m.SuperAdminDashboardComponent), title: 'SuperAdmin Dashboard' }
];