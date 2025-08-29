import { Routes } from '@angular/router';

export const lockingHistoryRoutes: Routes = [
  {
    path: '', loadComponent: () => import('./layout.component').then((m) => m.LayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./subject-list.component').then((m) => m.SubjectListComponent), title: 'Subject List' },
    ],
  },
];
