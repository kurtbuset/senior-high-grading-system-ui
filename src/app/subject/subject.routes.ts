import { Routes } from '@angular/router';

export const subjectRoutes: Routes = [
  { path: '', loadComponent: () => import('./layout.component').then(m => m.LayoutComponent) ,
    children: [
      { path: '', loadComponent: () => import('./subject-list.component').then(m => m.SubjectListComponent), title: 'Subjects' },
      { path: 'students', loadComponent: () => import('./student-list.component').then(m => m.StudentListComponent), title: 'Students' }
    ]
  }
]