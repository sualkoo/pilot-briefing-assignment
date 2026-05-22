import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing-page/landing-page.component').then(
        (m) => m.LandingPageComponent,
      ),
  },
  {
    path: 'briefing',
    loadComponent: () =>
      import('./pages/pilot-briefing/pilot-briefing.component').then(
        (m) => m.PilotBriefingComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
