import { Routes } from '@angular/router';

export const ecrRoutes: Routes = [
  { path: '', loadComponent: () => import('./layout.component').then(m => m.LayoutComponent), 
    children: [
      { path: '', loadComponent: () => import('./final-semester-grade-sheet.component').then(m => m.FinalSemesterGradeSheetComponent), title: 'Final Semester Grade Sheet' },

      // quarterly grade sheet routes
      { path: '1st-quarter', loadComponent: () => import('./quarterly-grade-sheet.component').then(m => m.QuarterlyGradeSheetComponent), data: { quarter: 'First Quarter' }, title: 'First Quarter Grade Sheet' },
      { path: '2nd-quarter', loadComponent: () => import('./quarterly-grade-sheet.component').then(m => m.QuarterlyGradeSheetComponent), data: { quarter: 'Second Quarter' }, title: 'Second Quarter Grade Sheet' },

      // first quarter assessments
      { path: '1st-quarter/written-work', loadComponent: () => import('./assessment-type.component').then(m => m.AssessmentTypeComponent), data: { quarter: 'First Quarter', type: 'Written Work' }, title: 'Written Work' },
      { path: '1st-quarter/performance-tasks', loadComponent: () => import('./assessment-type.component').then(m => m.AssessmentTypeComponent), data: { quarter: 'First Quarter', type: 'Performance Tasks' }, title: 'Performance Tasks' },
      { path: '1st-quarter/quarterly-assessment', loadComponent: () => import('./assessment-type.component').then(m => m.AssessmentTypeComponent), data: { quarter: 'First Quarter', type: 'Quarterly Assesment' }, title: 'Quarterly Assesment' },


      // second quarter assessments
      { path: '2nd-quarter/written-work', loadComponent: () => import('./assessment-type.component').then(m => m.AssessmentTypeComponent), data: { quarter: 'Second Quarter', type: 'Written Work' }, title: 'Written Work' },
      { path: '2nd-quarter/performance-tasks', loadComponent: () => import('./assessment-type.component').then(m => m.AssessmentTypeComponent), data: { quarter: 'Second Quarter', type: 'Performance Tasks' }, title: 'Performance Tasks' },
      { path: '2nd-quarter/quarterly-assessment', loadComponent: () => import('./assessment-type.component').then(m => m.AssessmentTypeComponent), data: { quarter: 'Second Quarter', type: 'Quarterly Assesment' }, title: 'Quarterly Assesment' },
    ] 
  }
] 