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
        path: ':quarter/:type/:id',
        loadComponent: () => import('./add-score.component').then(m => m.AddScoreComponent),
        title: 'Add Score',
      },    

    ],
  },
];
