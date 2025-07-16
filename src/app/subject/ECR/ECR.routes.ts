import { Routes } from '@angular/router';

export const ecrRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./final-semester-grade-sheet.component').then(
            (m) => m.FinalSemesterGradeSheetComponent
          ),
        title: 'Final Semester Grade Sheet',
      },

      {
        path: ':quarter',
        loadComponent: () =>
          import('./quarterly-grade-sheet.component').then(
            (m) => m.QuarterlyGradeSheetComponent
          ),
        title: 'Quarter Grade Sheet',
      },

       {
        path: ':quarter/:type',
        loadComponent: () => import('./assessment-type.component').then(m => m.AssessmentTypeComponent)
      },  

      {
        path: ':quarter/:type/add/:id',
        loadComponent: () => import('./add-edit-score.component').then(m => m.AddEditScoreComponent),
        title: 'Add Score',
      },    
      {
        path: ':quarter/:type/edit/:id',
        loadComponent: () => import('./add-edit-score.component').then(m => m.AddEditScoreComponent),
        title: 'Edit Score',
      },    

    ],
  },
];
