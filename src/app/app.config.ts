import {
  ApplicationConfig,
  InjectionToken,
  LOCALE_ID,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const API_URL = new InjectionToken<string>('API_URL');
export const APP_TIMEZONE = new InjectionToken<string>('APP_TIMEZONE');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    { provide: API_URL, useValue: environment.apiUrl },
    { provide: LOCALE_ID, useValue: 'sk-SK' },
    { provide: APP_TIMEZONE, useValue: 'Europe/Bratislava' },
  ],
};
