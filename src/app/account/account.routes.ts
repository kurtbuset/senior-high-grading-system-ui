import { Routes } from '@angular/router';

export const accountRoutes: Routes = [
  { path: '', loadComponent: () => import('./layout.component').then(m => m.LayoutComponent), 
    children: [
      { path: 'login', loadComponent: () => import('./login.component').then((m) => m.LoginComponent), title: 'Login' },
      { path: 'register', loadComponent: () => import('./register.component').then((m) => m.RegisterComponent), title: 'Register' },
      { path: 'verify-email', loadComponent: () => import('./verify-email.component').then((m) => m.VerifyEmailComponent), title: 'Verify Email' },

      { path: '', pathMatch: 'full', redirectTo: 'login' }
    ]
  }
];

