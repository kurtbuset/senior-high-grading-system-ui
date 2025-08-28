import { Routes } from '@angular/router';

export const profileRoutes: Routes = [
  { path: '', loadComponent: () => import('./layout.component').then(m => m.LayoutComponent), 
    children: [
      { path: '', loadComponent: () => import('./details.component').then((m) => m.DetailsComponent), title: 'Profile details' },
      { path: 'edit', loadComponent: () => import('./update.component').then((m) => m.UpdateComponent), title: 'Modify Account' },
    ]
  }
];

