import { Routes } from '@angular/router';
import { ecrRoutes } from './ECR/ECR.routes';

export const subjectRoutes: Routes = [
  { path: '', loadComponent: () => import('./layout.component').then(m => m.LayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./subject-list.component').then(m => m.SubjectListComponent), title: 'Subjects' },
      { path: 'students/:id', loadComponent: () => import('./student-list.component').then(m => m.StudentListComponent), title: 'Students' },
      { path: ':id', children: ecrRoutes },
    ]
  }
]   