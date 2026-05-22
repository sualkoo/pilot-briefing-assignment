import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { LandingPageComponent } from './landing-page.component';
import { routes } from '../../app.routes';

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageComponent],
      providers: [provideRouter(routes)],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the hero title', () => {
    const title: HTMLElement =
      fixture.nativeElement.querySelector('.hero-title');
    expect(title.textContent).toContain('Fly Informed.');
    expect(title.textContent).toContain('Fly Safe.');
  });

  it('should render all three feature labels', () => {
    const features: NodeListOf<HTMLElement> =
      fixture.nativeElement.querySelectorAll('.hero-feature strong');
    const labels = Array.from(features).map((el) => el.textContent?.trim());
    expect(labels).toEqual(['METAR', 'TAF', 'SIGMET']);
  });

  it('should have the CTA button linking to /briefing', () => {
    const btn = fixture.debugElement.query(By.css('.hero-cta'));
    expect(btn.attributes['routerLink']).toBe('/briefing');
  });
});
