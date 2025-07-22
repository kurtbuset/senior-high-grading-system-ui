import { Routes } from '@angular/router';

export const accountRoutes: Routes = [
  { path: '', loadComponent: () => import('./list.component').then(m => m.ListComponent) },
]