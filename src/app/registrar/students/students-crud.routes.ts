import { Routes } from '@angular/router';

export const studentsCrudRoutes: Routes = [
    { path: '', loadComponent: () => import('./layout.component').then(m => m.LayoutComponent),
        children: [
            { path: '', loadComponent: () => import('./student-list.component').then(m => m.StudentListComponent), title: 'Students List' },
            // { path: 'view/:id', loadComponent: () => import('./view.component').then(m => m.ViewComponent), title: 'View Account Details' },
            // { path: 'add', loadComponent: () => import('./add-edit.component').then(m => m.AddEditComponent), title: 'Add Account' },
            // { path: 'edit/:id', loadComponent: () => import('./add-edit.component').then(m => m.AddEditComponent), title: 'Edit Account' },
        ]
      }
]