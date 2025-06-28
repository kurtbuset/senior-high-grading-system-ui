import { Routes } from '@angular/router';

export const profileRoutes: Routes = [
  { path: '', loadComponent: () => import('./layout.component').then(m => m.LayoutComponent), 
    children: [
      //  { path: '', pathMatch: 'full', redirectTo: 'test' }, // or any default child

      { path: '', loadComponent: () => import('./test.component').then((m) => m.TestComponent), title: 'Profile' },
    ]
  }
];

