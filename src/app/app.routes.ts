import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { PilotBriefingComponent } from './pages/pilot-briefing/pilot-briefing.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'briefing', component: PilotBriefingComponent },
  { path: '**', redirectTo: '' },
];
