import { Routes } from '@angular/router';

export const subjectRoutes: Routes = [
  { path: '', loadComponent: () => import('./list.component').then(m => m.ListComponent) },
]