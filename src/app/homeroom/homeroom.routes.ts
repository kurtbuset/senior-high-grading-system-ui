import { Routes } from '@angular/router';
import { consolidatedSheetRoutes } from './consolidated-sheet/consolidated-sheet.routes';

export const homeroomRoutes: Routes = [
  { path: '', loadComponent: () => import('./layout.component').then(m => m.LayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./homeroom-list.component').then(m => m.HomeroomListComponent), title: 'Homerooms' },
      { path: ':id', children: consolidatedSheetRoutes },
    ]
  }
]   