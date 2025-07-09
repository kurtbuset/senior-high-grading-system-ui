import { Routes } from '@angular/router';

export const ecrRoutes: Routes = [
  { path: '', loadComponent: () => import('./layout.component').then(m => m.LayoutComponent), 
    children: [
      { path: '', loadComponent: () => import('./grading-summary.component').then(m => m.GradingSummaryComponent), title: 'Grading Summary' },
      { path: '1st-quarter', loadComponent: () => import('./first quarter/first-quarter.component').then(m => m.FirstQuarterComponent), title: 'First Quarter' },
      { path: '1st-quarter/written-work', loadComponent: () => import('./first quarter/written-work.component').then(m => m.WrittenWorkComponent), title: 'Written Work' },
    ]
  }
] 