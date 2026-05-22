import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BriefingFormComponent } from './briefing-form.component';
import { BriefingRequest } from '../../models/briefing.models';

function makeInputEvent(value: string): Event {
  const input = document.createElement('input');
  input.value = value;
  return { target: input } as unknown as Event;
}

describe('BriefingFormComponent', () => {
  let component: BriefingFormComponent;
  let fixture: ComponentFixture<BriefingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BriefingFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BriefingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Initial state ──────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('should have submitted as false', () => {
      expect(component.submitted).toBeFalse();
    });

    it('should start with an invalid form', () => {
      expect(component.form.invalid).toBeTrue();
    });

    it('should have empty reportTypes', () => {
      expect(component.reportTypesControl.value).toEqual([]);
    });

    it('should have empty airportCodes', () => {
      expect(component.airportCodesControl.value).toBe('');
    });

    it('should have empty countryCodes', () => {
      expect(component.countryCodesControl.value).toBe('');
    });
  });

  // ── Validators: reportTypes ────────────────────────────────────────────────

  describe('reportTypes validator', () => {
    it('should have noReportType error when no type is selected', () => {
      expect(component.reportTypesControl.hasError('noReportType')).toBeTrue();
    });

    it('should clear noReportType error when a single type is selected', () => {
      component.reportTypesControl.setValue(['METAR']);
      expect(component.reportTypesControl.hasError('noReportType')).toBeFalse();
    });

    it('should clear noReportType error when multiple types are selected', () => {
      component.reportTypesControl.setValue(['METAR', 'SIGMET', 'TAF_LONGTAF']);
      expect(component.reportTypesControl.hasError('noReportType')).toBeFalse();
    });
  });

  // ── Validators: airportCodes pattern ──────────────────────────────────────

  describe('airportCodes pattern validator', () => {
    it('should be valid for a single 4-letter ICAO code', () => {
      component.airportCodesControl.setValue('EGLL');
      expect(component.airportCodesControl.hasError('pattern')).toBeFalse();
    });

    it('should be valid for multiple codes separated by spaces', () => {
      component.airportCodesControl.setValue('EGLL LFPG EHAM');
      expect(component.airportCodesControl.hasError('pattern')).toBeFalse();
    });

    it('should be invalid for a code shorter than 4 letters', () => {
      component.airportCodesControl.setValue('EGL');
      expect(component.airportCodesControl.hasError('pattern')).toBeTrue();
    });

    it('should be invalid for a code longer than 4 letters', () => {
      component.airportCodesControl.setValue('EGLLX');
      expect(component.airportCodesControl.hasError('pattern')).toBeTrue();
    });

    it('should be invalid for lowercase letters', () => {
      component.airportCodesControl.setValue('egll');
      expect(component.airportCodesControl.hasError('pattern')).toBeTrue();
    });

    it('should be invalid for codes containing digits', () => {
      component.airportCodesControl.setValue('EGL1');
      expect(component.airportCodesControl.hasError('pattern')).toBeTrue();
    });

    it('should be valid when empty', () => {
      component.airportCodesControl.setValue('');
      expect(component.airportCodesControl.hasError('pattern')).toBeFalse();
    });
  });

  // ── Validators: countryCodes pattern ──────────────────────────────────────

  describe('countryCodes pattern validator', () => {
    it('should be valid for a single 2-letter WMO code', () => {
      component.countryCodesControl.setValue('DE');
      expect(component.countryCodesControl.hasError('pattern')).toBeFalse();
    });

    it('should be valid for multiple codes separated by spaces', () => {
      component.countryCodesControl.setValue('DE FR NL');
      expect(component.countryCodesControl.hasError('pattern')).toBeFalse();
    });

    it('should be invalid for a single-letter code', () => {
      component.countryCodesControl.setValue('D');
      expect(component.countryCodesControl.hasError('pattern')).toBeTrue();
    });

    it('should be invalid for a 3-letter code', () => {
      component.countryCodesControl.setValue('DEU');
      expect(component.countryCodesControl.hasError('pattern')).toBeTrue();
    });

    it('should be invalid for lowercase letters', () => {
      component.countryCodesControl.setValue('de');
      expect(component.countryCodesControl.hasError('pattern')).toBeTrue();
    });

    it('should be valid when empty', () => {
      component.countryCodesControl.setValue('');
      expect(component.countryCodesControl.hasError('pattern')).toBeFalse();
    });
  });

  // ── Validators: locationRequired (form-level) ─────────────────────────────

  describe('locationRequired form-level validator', () => {
    it('should report locationRequired when both fields are empty', () => {
      expect(component.form.hasError('locationRequired')).toBeTrue();
    });

    it('should clear the error when airportCodes is set', () => {
      component.airportCodesControl.setValue('EGLL');
      expect(component.form.hasError('locationRequired')).toBeFalse();
    });

    it('should clear the error when countryCodes is set', () => {
      component.countryCodesControl.setValue('DE');
      expect(component.form.hasError('locationRequired')).toBeFalse();
    });

    it('should clear the error when both fields are set', () => {
      component.airportCodesControl.setValue('EGLL');
      component.countryCodesControl.setValue('DE');
      expect(component.form.hasError('locationRequired')).toBeFalse();
    });
  });

  // ── onCodesInput() ────────────────────────────────────────────────────────

  describe('onCodesInput()', () => {
    it('should convert the DOM input value to uppercase', () => {
      const event = makeInputEvent('egll');
      component.onCodesInput(event, 'airportCodes');
      expect((event.target as HTMLInputElement).value).toBe('EGLL');
    });

    it('should update the airportCodes control to uppercase', () => {
      component.onCodesInput(makeInputEvent('egll'), 'airportCodes');
      expect(component.airportCodesControl.value).toBe('EGLL');
    });

    it('should update the countryCodes control to uppercase', () => {
      component.onCodesInput(makeInputEvent('de'), 'countryCodes');
      expect(component.countryCodesControl.value).toBe('DE');
    });

    it('should leave already-uppercase input unchanged', () => {
      component.onCodesInput(makeInputEvent('EGLL LFPG'), 'airportCodes');
      expect(component.airportCodesControl.value).toBe('EGLL LFPG');
    });
  });

  // ── submit() ──────────────────────────────────────────────────────────────

  describe('submit()', () => {
    it('should set submitted to true', () => {
      component.submit();
      expect(component.submitted).toBeTrue();
    });

    it('should mark all controls as touched', () => {
      component.submit();
      expect(component.reportTypesControl.touched).toBeTrue();
      expect(component.airportCodesControl.touched).toBeTrue();
      expect(component.countryCodesControl.touched).toBeTrue();
    });

    it('should not emit briefingRequested when form is invalid', () => {
      const spy = jasmine.createSpy('briefingRequested');
      component.briefingRequested.subscribe(spy);

      component.submit();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should emit briefingRequested with correct payload when only airports are provided', () => {
      const emitted: BriefingRequest[] = [];
      component.briefingRequested.subscribe((r) => emitted.push(r));

      component.reportTypesControl.setValue(['METAR']);
      component.airportCodesControl.setValue('EGLL');
      component.submit();

      expect(emitted.length).toBe(1);
      expect(emitted[0]).toEqual({
        reportTypes: ['METAR'],
        airports: ['EGLL'],
        countries: [],
      });
    });

    it('should split multiple airport codes into an array', () => {
      const emitted: BriefingRequest[] = [];
      component.briefingRequested.subscribe((r) => emitted.push(r));

      component.reportTypesControl.setValue(['METAR']);
      component.airportCodesControl.setValue('EGLL LFPG EHAM');
      component.submit();

      expect(emitted[0].airports).toEqual(['EGLL', 'LFPG', 'EHAM']);
    });

    it('should split multiple country codes into an array', () => {
      const emitted: BriefingRequest[] = [];
      component.briefingRequested.subscribe((r) => emitted.push(r));

      component.reportTypesControl.setValue(['SIGMET']);
      component.countryCodesControl.setValue('DE FR NL');
      component.submit();

      expect(emitted[0].countries).toEqual(['DE', 'FR', 'NL']);
    });

    it('should handle multiple space separators between codes', () => {
      const emitted: BriefingRequest[] = [];
      component.briefingRequested.subscribe((r) => emitted.push(r));

      component.reportTypesControl.setValue(['METAR']);
      component.airportCodesControl.setValue('EGLL  LFPG');
      component.submit();

      expect(emitted[0].airports).toEqual(['EGLL', 'LFPG']);
    });

    it('should include all selected report types in the payload', () => {
      const emitted: BriefingRequest[] = [];
      component.briefingRequested.subscribe((r) => emitted.push(r));

      component.reportTypesControl.setValue(['METAR', 'TAF_LONGTAF']);
      component.airportCodesControl.setValue('EGLL');
      component.submit();

      expect(emitted[0].reportTypes).toEqual(['METAR', 'TAF_LONGTAF']);
    });

    it('should include both airports and countries when both are provided', () => {
      const emitted: BriefingRequest[] = [];
      component.briefingRequested.subscribe((r) => emitted.push(r));

      component.reportTypesControl.setValue(['METAR']);
      component.airportCodesControl.setValue('EGLL');
      component.countryCodesControl.setValue('DE');
      component.submit();

      expect(emitted[0]).toEqual({
        reportTypes: ['METAR'],
        airports: ['EGLL'],
        countries: ['DE'],
      });
    });
  });

  // ── reset() ───────────────────────────────────────────────────────────────

  describe('reset()', () => {
    beforeEach(() => {
      component.reportTypesControl.setValue(['METAR']);
      component.airportCodesControl.setValue('EGLL');
      component.countryCodesControl.setValue('DE');
      component.submitted = true;
    });

    it('should set submitted back to false', () => {
      component.reset();
      expect(component.submitted).toBeFalse();
    });

    it('should emit resetRequested', () => {
      const spy = jasmine.createSpy('resetRequested');
      component.resetRequested.subscribe(spy);
      component.reset();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should clear reportTypes to an empty array', () => {
      component.reset();
      expect(component.reportTypesControl.value).toEqual([]);
    });

    it('should clear airportCodes to an empty string', () => {
      component.reset();
      expect(component.airportCodesControl.value).toBe('');
    });

    it('should clear countryCodes to an empty string', () => {
      component.reset();
      expect(component.countryCodesControl.value).toBe('');
    });

    it('should restore the form to a pristine state', () => {
      component.reset();
      expect(component.form.pristine).toBeTrue();
    });

    it('should make the form invalid again after reset', () => {
      component.reset();
      expect(component.form.invalid).toBeTrue();
    });
  });
});
