import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { WeatherService } from './weather.service';
import { API_URL } from '../app.config';
import { BriefingRequest } from '../models/briefing.models';

const API_ENDPOINT = 'https://ogcie.iblsoft.com/ria/opmetquery';

function makeRequest(
  overrides: Partial<BriefingRequest> = {},
): BriefingRequest {
  return {
    reportTypes: ['METAR'],
    airports: ['LZIB', 'LKPR'],
    countries: [],
    ...overrides,
  };
}

describe('WeatherService', () => {
  let service: WeatherService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WeatherService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: API_ENDPOINT },
      ],
    });
    service = TestBed.inject(WeatherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('getBriefing', () => {
    it('should POST to the correct URL', () => {
      service.getBriefing(makeRequest()).subscribe();
      const req = httpMock.expectOne(API_ENDPOINT);
      expect(req.request.method).toBe('POST');
      req.flush({ error: null, result: [] });
    });

    it('should send the correct JSON-RPC body', () => {
      const request = makeRequest({
        reportTypes: ['METAR', 'TAF'],
        airports: ['LZIB'],
        countries: ['SK'],
      });
      service.getBriefing(request).subscribe();

      const req = httpMock.expectOne(API_ENDPOINT);
      const body = req.request.body;

      expect(body.method).toBe('query');
      expect(body.params[0].reportTypes).toEqual(['METAR', 'TAF']);
      expect(body.params[0].stations).toEqual(['LZIB']);
      expect(body.params[0].countries).toEqual(['SK']);

      req.flush({ error: null, result: [] });
    });

    it('should use unique IDs across successive calls', () => {
      service.getBriefing(makeRequest()).subscribe();
      const req1 = httpMock.expectOne(API_ENDPOINT);
      const id1: string = req1.request.body.id;
      req1.flush({ error: null, result: [] });

      service.getBriefing(makeRequest()).subscribe();
      const req2 = httpMock.expectOne(API_ENDPOINT);
      const id2: string = req2.request.body.id;
      req2.flush({ error: null, result: [] });

      expect(id1).not.toBe(id2);
    });

    it('should map a successful response to BriefingResult', () => {
      const apiResult = [
        {
          queryType: 'METAR',
          reportTime: '2026-05-22T10:00:00Z',
          stationId: 'LZIB',
          text: 'METAR LZIB 221000Z ...',
        },
      ];

      let result: unknown;
      service.getBriefing(makeRequest()).subscribe((r) => (result = r));
      httpMock
        .expectOne(API_ENDPOINT)
        .flush({ error: null, result: apiResult });

      expect(result).toEqual({
        reports: [
          {
            queryType: 'METAR',
            reportTime: '2026-05-22T10:00:00Z',
            stationId: 'LZIB',
            text: 'METAR LZIB 221000Z ...',
          },
        ],
      });
    });

    it('should default missing fields to empty strings', () => {
      const apiResult = [{ queryType: 'METAR' }];

      let result: unknown;
      service.getBriefing(makeRequest()).subscribe((r) => (result = r));
      httpMock
        .expectOne(API_ENDPOINT)
        .flush({ error: null, result: apiResult });

      expect(result).toEqual({
        reports: [
          { queryType: 'METAR', stationId: '', reportTime: '', text: '' },
        ],
      });
    });

    it('should return an empty reports array for an empty result', () => {
      let result: unknown;
      service.getBriefing(makeRequest()).subscribe((r) => (result = r));
      httpMock.expectOne(API_ENDPOINT).flush({ error: null, result: [] });

      expect(result).toEqual({ reports: [] });
    });

    it('should emit an error when the API returns an error object', () => {
      let thrownError: Error | undefined;
      service
        .getBriefing(makeRequest())
        .subscribe({ error: (e: Error) => (thrownError = e) });

      httpMock
        .expectOne(API_ENDPOINT)
        .flush({ error: { code: 500, message: 'Server failure' }, result: [] });

      expect(thrownError).toBeInstanceOf(Error);
      expect(thrownError?.message).toBe('Server failure');
    });

    it('should emit an error on HTTP failure', () => {
      let thrownError: unknown;
      service
        .getBriefing(makeRequest())
        .subscribe({ error: (e: unknown) => (thrownError = e) });

      httpMock
        .expectOne(API_ENDPOINT)
        .error(new ProgressEvent('network error'));

      expect(thrownError).toBeTruthy();
    });
  });
});
