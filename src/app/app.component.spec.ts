import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { API_URL, APP_TIMEZONE } from './app.config';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter(routes),
        { provide: API_URL, useValue: 'https://test.invalid' },
        { provide: APP_TIMEZONE, useValue: 'UTC' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('goBack', () => {
    it('should navigate to the root route', async () => {
      const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
      component.goBack();
      expect(navigateSpy).toHaveBeenCalledOnceWith(['/']);
    });
  });

  describe('template', () => {
    it('should render the nav brand title', () => {
      const nav = fixture.nativeElement.querySelector('.nav-brand span');
      expect(nav.textContent.trim()).toBe('Pilot Weather Briefing');
    });

    it('should not show the back button on the root route', async () => {
      await router.navigate(['/']);
      fixture.detectChanges();
      const btn = fixture.nativeElement.querySelector('.nav-back-btn');
      expect(btn).toBeNull();
    });

    it('should show the back button on the /briefing route', async () => {
      await router.navigate(['/briefing']);
      fixture.detectChanges();
      const btn = fixture.nativeElement.querySelector('.nav-back-btn');
      expect(btn).toBeTruthy();
    });

    it('should call goBack when the back button is clicked', async () => {
      await router.navigate(['/briefing']);
      fixture.detectChanges();
      const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
      fixture.nativeElement.querySelector('.nav-back-btn').click();
      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('should render the footer tagline', () => {
      const tagline = fixture.nativeElement.querySelector('.footer-tagline');
      expect(tagline.textContent.trim()).toBe('Fly informed. Fly safe.');
    });
  });
});
