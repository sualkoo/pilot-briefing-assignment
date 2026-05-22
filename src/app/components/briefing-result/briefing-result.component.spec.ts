import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

import { BriefingResultComponent } from './briefing-result.component';
import { BriefingResult, WeatherReport } from '../../models/briefing.models';

function makeReport(
  stationId: string,
  overrides: Partial<WeatherReport> = {},
): WeatherReport {
  return {
    stationId,
    queryType: 'METAR',
    reportTime: '2026-05-22T10:00:00Z',
    text: 'SOME METAR TEXT',
    ...overrides,
  };
}

function makeResult(reports: WeatherReport[]): BriefingResult {
  return { reports };
}

describe('BriefingResultComponent', () => {
  let component: BriefingResultComponent;
  let fixture: ComponentFixture<BriefingResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BriefingResultComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BriefingResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have result as null', () => {
      expect(component.result).toBeNull();
    });

    it('should have loading as false', () => {
      expect(component.loading).toBeFalse();
    });

    it('should have empty tableData', () => {
      expect(component.tableData).toEqual([]);
    });

    it('should have totalReports as 0', () => {
      expect(component.totalReports).toBe(0);
    });

    it('should have default pageSize of 10', () => {
      expect(component.pageSize).toBe(10);
    });

    it('should have pageIndex of 0', () => {
      expect(component.pageIndex).toBe(0);
    });

    it('should expose the correct displayedColumns', () => {
      expect(component.displayedColumns).toEqual([
        'queryType',
        'reportTime',
        'text',
      ]);
    });
  });

  describe('ngOnChanges', () => {
    it('should reset pageIndex to 0 when result changes', () => {
      component.pageIndex = 3;
      component.result = makeResult([makeReport('LZIB')]);
      component.ngOnChanges({
        result: new SimpleChange(null, component.result, false),
      });
      expect(component.pageIndex).toBe(0);
    });

    it('should not reset pageIndex when a different input changes', () => {
      component.pageIndex = 2;
      component.ngOnChanges({
        loading: new SimpleChange(false, true, false),
      });
      expect(component.pageIndex).toBe(2);
    });

    it('should build table data after a result change', () => {
      component.result = makeResult([makeReport('LZIB'), makeReport('LKPR')]);
      component.ngOnChanges({
        result: new SimpleChange(null, component.result, false),
      });
      expect(component.totalReports).toBe(2);
    });
  });

  describe('buildTableData (via ngOnChanges)', () => {
    it('should produce empty tableData when result is null', () => {
      component.result = null;
      component.ngOnChanges({
        result: new SimpleChange(makeResult([]), null, false),
      });
      expect(component.tableData).toEqual([]);
      expect(component.totalReports).toBe(0);
    });

    it('should produce empty tableData when result has no reports', () => {
      component.result = makeResult([]);
      component.ngOnChanges({
        result: new SimpleChange(null, component.result, false),
      });
      expect(component.tableData).toEqual([]);
      expect(component.totalReports).toBe(0);
    });

    it('should prepend a group header row before each station group', () => {
      const reports = [
        makeReport('LZIB'),
        makeReport('LZIB'),
        makeReport('LKPR'),
      ];
      component.result = makeResult(reports);
      component.ngOnChanges({
        result: new SimpleChange(null, component.result, false),
      });

      expect(component.tableData.length).toBe(5);

      const groupRows = component.tableData.filter(
        (r) => (r as { isGroup?: boolean }).isGroup === true,
      );
      expect(groupRows.length).toBe(2);
    });

    it('should set totalReports to the full report count', () => {
      const reports = [
        makeReport('LZIB'),
        makeReport('LKPR'),
        makeReport('EGLL'),
      ];
      component.result = makeResult(reports);
      component.ngOnChanges({
        result: new SimpleChange(null, component.result, false),
      });
      expect(component.totalReports).toBe(3);
    });

    it('should respect pageSize and only include current page reports', () => {
      const reports = Array.from({ length: 15 }, (_, i) =>
        makeReport(`ST${i}`),
      );
      component.result = makeResult(reports);
      component.pageSize = 10;
      component.ngOnChanges({
        result: new SimpleChange(null, component.result, false),
      });

      expect(component.tableData.length).toBe(20);
      expect(component.totalReports).toBe(15);
    });
  });

  describe('onPage', () => {
    it('should update pageIndex and pageSize and rebuild table', () => {
      const reports = Array.from({ length: 20 }, (_, i) =>
        makeReport('LZIB', { queryType: `TYPE${i}` }),
      );
      component.result = makeResult(reports);
      component.ngOnChanges({
        result: new SimpleChange(null, component.result, false),
      });

      const event: PageEvent = { pageIndex: 1, pageSize: 5, length: 20 };
      component.onPage(event);

      expect(component.pageIndex).toBe(1);
      expect(component.pageSize).toBe(5);
      expect(component.tableData.length).toBe(6);
    });
  });

  describe('isGroup', () => {
    it('should return true for a group row', () => {
      const row = { isGroup: true as const, stationId: 'LZIB' };
      expect(component.isGroup(0, row)).toBeTrue();
    });

    it('should return false for a WeatherReport row', () => {
      const row = makeReport('LZIB');
      expect(component.isGroup(0, row)).toBeFalse();
    });
  });

  describe('formatTime', () => {
    it('should return em-dash for an empty string', () => {
      expect(component.formatTime('')).toBe('—');
    });

    it('should return a non-empty string for a valid ISO date', () => {
      const result = component.formatTime('2026-05-22T10:00:00Z');
      expect(result.length).toBeGreaterThan(0);
      expect(result).not.toBe('—');
    });
  });

  describe('getTextSegments', () => {
    it('should return a single null-color segment for plain text', () => {
      const segments = component.getTextSegments('CAVOK');
      expect(segments).toEqual([{ text: 'CAVOK', color: null }]);
    });

    it('should return an empty array for an empty string', () => {
      const segments = component.getTextSegments('');
      expect(segments).toEqual([]);
    });

    it('should assign cloud-blue for a cloud value <= 30', () => {
      const segments = component.getTextSegments('BKN020');
      const cloud = segments.find((s) => s.text === 'BKN020');
      expect(cloud?.color).toBe('cloud-blue');
    });

    it('should assign cloud-red for a cloud value > 30', () => {
      const segments = component.getTextSegments('SCT045');
      const cloud = segments.find((s) => s.text === 'SCT045');
      expect(cloud?.color).toBe('cloud-red');
    });

    it('should assign cloud-blue at the boundary value of 30', () => {
      const segments = component.getTextSegments('FEW030');
      const cloud = segments.find((s) => s.text === 'FEW030');
      expect(cloud?.color).toBe('cloud-blue');
    });

    it('should split text around a cloud token correctly', () => {
      const segments = component.getTextSegments('prefix BKN010 suffix');
      expect(segments).toEqual([
        { text: 'prefix ', color: null },
        { text: 'BKN010', color: 'cloud-blue' },
        { text: ' suffix', color: null },
      ]);
    });

    it('should handle multiple cloud tokens in one string', () => {
      const segments = component.getTextSegments('FEW010 BKN030 SCT050');
      const colors = segments
        .filter((s) => s.color !== null)
        .map((s) => s.color);
      expect(colors).toEqual(['cloud-blue', 'cloud-blue', 'cloud-red']);
    });

    it('should handle all three prefixes: BKN, FEW, SCT', () => {
      ['BKN020', 'FEW020', 'SCT020'].forEach((token) => {
        const segments = component.getTextSegments(token);
        expect(segments[0].color).toBe('cloud-blue');
      });
    });
  });
});
