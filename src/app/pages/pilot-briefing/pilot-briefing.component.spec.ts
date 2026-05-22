import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { PilotBriefingComponent } from './pilot-briefing.component';
import { WeatherService } from '../../services/weather.service';
import { BriefingRequest, BriefingResult } from '../../models/briefing.models';

function makeRequest(
  overrides: Partial<BriefingRequest> = {},
): BriefingRequest {
  return {
    reportTypes: ['METAR'],
    airports: ['LZIB'],
    countries: [],
    ...overrides,
  };
}

function makeResult(reports = []): BriefingResult {
  return { reports };
}

describe('PilotBriefingComponent', () => {
  let component: PilotBriefingComponent;
  let fixture: ComponentFixture<PilotBriefingComponent>;
  let weatherServiceSpy: jasmine.SpyObj<WeatherService>;

  beforeEach(async () => {
    weatherServiceSpy = jasmine.createSpyObj('WeatherService', ['getBriefing']);

    await TestBed.configureTestingModule({
      imports: [PilotBriefingComponent],
      providers: [{ provide: WeatherService, useValue: weatherServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(PilotBriefingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have null result', () => {
      expect(component.result()).toBeNull();
    });

    it('should not be loading', () => {
      expect(component.loading()).toBeFalse();
    });

    it('should have null error', () => {
      expect(component.error()).toBeNull();
    });

    it('should not render the results section', () => {
      const section = fixture.nativeElement.querySelector('.results-section');
      expect(section).toBeNull();
    });
  });

  describe('onBriefingRequested', () => {
    it('should set loading and clear result and error before the call resolves', () => {
      weatherServiceSpy.getBriefing.and.returnValue(of(makeResult()));
      component.result.set(makeResult());
      component.error.set('old error');

      component.onBriefingRequested(makeRequest());

      expect(weatherServiceSpy.getBriefing).toHaveBeenCalledOnceWith(
        makeRequest(),
      );
    });

    it('should set result and clear loading on success', () => {
      const result = makeResult();
      weatherServiceSpy.getBriefing.and.returnValue(of(result));

      component.onBriefingRequested(makeRequest());

      expect(component.result()).toBe(result);
      expect(component.loading()).toBeFalse();
      expect(component.error()).toBeNull();
    });

    it('should show the results section after a successful call', () => {
      weatherServiceSpy.getBriefing.and.returnValue(of(makeResult()));
      component.onBriefingRequested(makeRequest());
      fixture.detectChanges();

      const section = fixture.nativeElement.querySelector('.results-section');
      expect(section).toBeTruthy();
    });

    it('should set an error message for an HttpErrorResponse', () => {
      const httpError = new HttpErrorResponse({ status: 503 });
      weatherServiceSpy.getBriefing.and.returnValue(
        throwError(() => httpError),
      );

      component.onBriefingRequested(makeRequest());

      expect(component.error()).toBe('Request failed — HTTP 503');
      expect(component.loading()).toBeFalse();
      expect(component.result()).toBeNull();
    });

    it('should set an error message for a generic Error', () => {
      weatherServiceSpy.getBriefing.and.returnValue(
        throwError(() => new Error('API down')),
      );

      component.onBriefingRequested(makeRequest());

      expect(component.error()).toBe('API down');
    });

    it('should set a fallback error message for unknown error types', () => {
      weatherServiceSpy.getBriefing.and.returnValue(
        throwError(() => 'unexpected'),
      );

      component.onBriefingRequested(makeRequest());

      expect(component.error()).toBe(
        'An unexpected error occurred. Please try again.',
      );
    });

    it('should render the error banner when an error occurs', () => {
      weatherServiceSpy.getBriefing.and.returnValue(
        throwError(() => new Error('Server error')),
      );
      component.onBriefingRequested(makeRequest());
      fixture.detectChanges();

      const banner = fixture.nativeElement.querySelector('.error-banner span');
      expect(banner.textContent.trim()).toBe('Server error');
    });
  });

  describe('onResetRequested', () => {
    it('should clear result, error, and loading', () => {
      component.result.set(makeResult());
      component.error.set('some error');
      component.loading.set(true);

      component.onResetRequested();

      expect(component.result()).toBeNull();
      expect(component.error()).toBeNull();
      expect(component.loading()).toBeFalse();
    });

    it('should hide the results section after reset', () => {
      weatherServiceSpy.getBriefing.and.returnValue(of(makeResult()));
      component.onBriefingRequested(makeRequest());
      fixture.detectChanges();

      component.onResetRequested();
      fixture.detectChanges();

      const section = fixture.nativeElement.querySelector('.results-section');
      expect(section).toBeNull();
    });
  });
});
