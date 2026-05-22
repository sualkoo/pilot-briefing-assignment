import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageEvent } from '@angular/material/paginator';

import { BriefingResultComponent } from './briefing-result.component';
import { APP_TIMEZONE } from '../../app.config';
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
      providers: [{ provide: APP_TIMEZONE, useValue: 'UTC' }],
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
      expect(component.result()).toBeNull();
    });

    it('should have loading as false', () => {
      expect(component.loading()).toBeFalse();
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

  describe('result input', () => {
    it('should reset pageIndex to 0 when result changes', () => {
      component.pageIndex = 3;
      fixture.componentRef.setInput('result', makeResult([makeReport('LZIB')]));
      fixture.detectChanges();
      expect(component.pageIndex).toBe(0);
    });

    it('should not reset pageIndex when a different input changes', () => {
      component.pageIndex = 2;
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      expect(component.pageIndex).toBe(2);
    });

    it('should build table data after a result change', () => {
      fixture.componentRef.setInput(
        'result',
        makeResult([makeReport('LZIB'), makeReport('LKPR')]),
      );
      fixture.detectChanges();
      expect(component.totalReports).toBe(2);
    });
  });

  describe('buildTableData (via result input)', () => {
    it('should produce empty tableData when result is null', () => {
      fixture.componentRef.setInput('result', null);
      fixture.detectChanges();
      expect(component.tableData).toEqual([]);
      expect(component.totalReports).toBe(0);
    });

    it('should produce empty tableData when result has no reports', () => {
      fixture.componentRef.setInput('result', makeResult([]));
      fixture.detectChanges();
      expect(component.tableData).toEqual([]);
      expect(component.totalReports).toBe(0);
    });

    it('should prepend a group header row before each station group', () => {
      const reports = [
        makeReport('LZIB'),
        makeReport('LZIB'),
        makeReport('LKPR'),
      ];
      fixture.componentRef.setInput('result', makeResult(reports));
      fixture.detectChanges();

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
      fixture.componentRef.setInput('result', makeResult(reports));
      fixture.detectChanges();
      expect(component.totalReports).toBe(3);
    });

    it('should respect pageSize and only include current page reports', () => {
      const reports = Array.from({ length: 15 }, (_, i) =>
        makeReport(`ST${i}`),
      );
      component.pageSize = 10;
      fixture.componentRef.setInput('result', makeResult(reports));
      fixture.detectChanges();

      expect(component.tableData.length).toBe(20);
      expect(component.totalReports).toBe(15);
    });

    it('should not duplicate a station header across pages when reports are interleaved', () => {
      const interleaved = Array.from({ length: 20 }, (_, i) =>
        makeReport(i % 2 === 0 ? 'LZIB' : 'LKPR', { queryType: `T${i}` }),
      );
      component.pageSize = 10;
      fixture.componentRef.setInput('result', makeResult(interleaved));
      fixture.detectChanges();

      const groupHeaders = component.tableData.filter(
        (r) => (r as { isGroup?: boolean }).isGroup === true,
      );
      expect(groupHeaders.length).toBe(1);
      expect((groupHeaders[0] as { stationId: string }).stationId).toBe('LZIB');
    });
  });

  describe('groupByStation', () => {
    it('should place all reports from the same station contiguously', () => {
      const reports = [
        makeReport('LZIB', { queryType: 'T0' }),
        makeReport('LKPR', { queryType: 'T1' }),
        makeReport('LZIB', { queryType: 'T2' }),
        makeReport('LKPR', { queryType: 'T3' }),
      ];
      fixture.componentRef.setInput('result', makeResult(reports));
      fixture.detectChanges();

      const dataReports = component.tableData.filter(
        (r) => !(r as { isGroup?: boolean }).isGroup,
      ) as WeatherReport[];
      expect(dataReports.map((r) => r.stationId)).toEqual([
        'LZIB',
        'LZIB',
        'LKPR',
        'LKPR',
      ]);
    });

    it('should preserve first-seen station order', () => {
      const reports = [
        makeReport('EGLL'),
        makeReport('LZIB'),
        makeReport('LKPR'),
      ];
      fixture.componentRef.setInput('result', makeResult(reports));
      fixture.detectChanges();

      const headers = component.tableData.filter(
        (r) => (r as { isGroup?: boolean }).isGroup,
      ) as { stationId: string }[];
      expect(headers.map((h) => h.stationId)).toEqual(['EGLL', 'LZIB', 'LKPR']);
    });

    it('should handle a single station without reordering', () => {
      const reports = [
        makeReport('LZIB', { queryType: 'T0' }),
        makeReport('LZIB', { queryType: 'T1' }),
        makeReport('LZIB', { queryType: 'T2' }),
      ];
      fixture.componentRef.setInput('result', makeResult(reports));
      fixture.detectChanges();

      const dataReports = component.tableData.filter(
        (r) => !(r as { isGroup?: boolean }).isGroup,
      ) as WeatherReport[];
      expect(dataReports.every((r) => r.stationId === 'LZIB')).toBeTrue();
    });

    it('should handle an empty reports array', () => {
      fixture.componentRef.setInput('result', makeResult([]));
      fixture.detectChanges();
      expect(component.tableData).toEqual([]);
    });
  });

  describe('buildRows', () => {
    it('should produce exactly one header for a single-report result', () => {
      fixture.componentRef.setInput('result', makeResult([makeReport('LZIB')]));
      fixture.detectChanges();

      expect(component.tableData.length).toBe(2);
      expect(
        (component.tableData[0] as { isGroup?: boolean }).isGroup,
      ).toBeTrue();
      expect(
        (component.tableData[1] as { isGroup?: boolean }).isGroup,
      ).toBeUndefined();
    });

    it('should produce one header for multiple reports from the same station', () => {
      const reports = [
        makeReport('LZIB', { queryType: 'T0' }),
        makeReport('LZIB', { queryType: 'T1' }),
        makeReport('LZIB', { queryType: 'T2' }),
      ];
      fixture.componentRef.setInput('result', makeResult(reports));
      fixture.detectChanges();

      const headers = component.tableData.filter(
        (r) => (r as { isGroup?: boolean }).isGroup,
      );
      expect(headers.length).toBe(1);
      expect(component.tableData.length).toBe(4);
    });

    it('should insert a new header at each station boundary', () => {
      const reports = [
        makeReport('LZIB', { queryType: 'T0' }),
        makeReport('LZIB', { queryType: 'T1' }),
        makeReport('LKPR', { queryType: 'T2' }),
      ];
      fixture.componentRef.setInput('result', makeResult(reports));
      fixture.detectChanges();

      expect(component.tableData.length).toBe(5);
      expect((component.tableData[0] as { stationId?: string }).stationId).toBe(
        'LZIB',
      );
      expect((component.tableData[3] as { stationId?: string }).stationId).toBe(
        'LKPR',
      );
    });

    it('should produce an empty row list for an empty result', () => {
      fixture.componentRef.setInput('result', makeResult([]));
      fixture.detectChanges();
      expect(component.tableData).toEqual([]);
    });
  });

  describe('onPage', () => {
    it('should update pageIndex and pageSize and rebuild table', () => {
      const reports = Array.from({ length: 20 }, (_, i) =>
        makeReport('LZIB', { queryType: `TYPE${i}` }),
      );
      fixture.componentRef.setInput('result', makeResult(reports));
      fixture.detectChanges();

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
