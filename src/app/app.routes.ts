import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./homepage/homepage').then((m) => m.Homepage),
  },

  {
    path: 'configuration',
    loadComponent: () => import('./configuration/configuration').then((m) => m.Configuration),
  },
  {
    path: '**',
    redirectTo: '',
  }
];
