import { Routes } from '@angular/router';

export const accountsCrudRoutes: Routes = [
    { path: '', loadComponent: () => import('./layout.component').then(m => m.LayoutComponent),
        children: [
            { path: '', loadComponent: () => import('./accounts-list.component').then(m => m.AccountsListComponent), title: 'Accounts List' },
            { path: 'view/:id', loadComponent: () => import('./view.component').then(m => m.ViewComponent), title: 'View Account Details' },
            { path: 'add', loadComponent: () => import('./add-edit.component').then(m => m.AddEditComponent), title: 'Add Account' },
            { path: 'edit/:id', loadComponent: () => import('./add-edit.component').then(m => m.AddEditComponent), title: 'Edit Account' },
        ]
      }
]