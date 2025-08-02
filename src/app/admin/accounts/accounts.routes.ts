import { Routes } from '@angular/router';

export const accountRoutes: Routes = [
  { path: '', loadComponent: () => import('./list.component').then(m => m.ListComponent) },
  { path: 'add', loadComponent: () => import('./add-edit.component').then(m => m.AddEditComponent) },
  { path: 'edit/:id', loadComponent: () => import('./add-edit.component').then(m => m.AddEditComponent) },
]
