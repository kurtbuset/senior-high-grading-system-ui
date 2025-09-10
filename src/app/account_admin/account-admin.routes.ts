import { Routes } from '@angular/router';
import { Role } from '@app/_models/role';

export const accountAdminRoutes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./layout.component').then(m => m.LayoutComponent),
    data: { roles: [Role.SuperAdmin] },
    children: [
      { 
        path: '', 
        loadComponent: () => import('./account-list.component').then(m => m.AccountListComponent), 
        title: 'Account Management' 
      },
      { 
        path: 'add', 
        loadComponent: () => import('./add-edit-account.component').then(m => m.AddEditAccountComponent), 
        title: 'Add Account' 
      },
      { 
        path: 'edit/:id', 
        loadComponent: () => import('./add-edit-account.component').then(m => m.AddEditAccountComponent), 
        title: 'Edit Account' 
      }
    ]
  }
];
