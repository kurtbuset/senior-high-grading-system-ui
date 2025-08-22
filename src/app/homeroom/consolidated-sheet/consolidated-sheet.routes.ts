import { Routes } from '@angular/router';

export const consolidatedSheetRoutes: Routes = [
  { path: '', loadComponent: () => import('./layout.component').then(m => m.LayoutComponent),
    children: [
      { path: ':semester', loadComponent: () => import('./semestral-consolidated.component').then(m => m.SemestralConsolidatedComponent), title: 'Semestral Consolidated' }
    ]
  }
]     