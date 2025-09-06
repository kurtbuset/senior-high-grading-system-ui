import { Routes } from '@angular/router';

export const studentRoutes: Routes = [
  { path: '', loadComponent: () => import('./egrade.component').then(m => m.EgradeComponent), title: 'E-Grade' },
  { path: 'profile', loadComponent: () => import('./profile-details.component').then(m => m.ProfileDetailsComponent), title: 'My Profile' },
  { path: 'modify-account', loadComponent: () => import('./modify-account.component').then(m => m.ModifyAccountComponent), title: 'Modify Account' }
];