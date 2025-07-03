import { Routes } from '@angular/router';

export const ecrRoutes: Routes = [
  { path: ':id', loadComponent: () => import('./grading-summary.component').then(m => m.GradingSummaryComponent), title: 'Grading Summary' }
]