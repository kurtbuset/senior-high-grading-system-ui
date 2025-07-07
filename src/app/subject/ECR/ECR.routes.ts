import { Routes } from '@angular/router';

export const ecrRoutes: Routes = [
  { path: '', loadComponent: () => import('./layout.component').then(m => m.LayoutComponent), 
    children: [
      { path: '', loadComponent: () => import('./grading-summary.component').then(m => m.GradingSummaryComponent), title: 'Grading Summary' },
      { path: '1st-quarter', loadComponent: () => import('./assessment.component').then(m => m.AssessmentComponent), title: 'First Quarter' },
    ]
  }
] 