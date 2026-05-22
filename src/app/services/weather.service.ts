import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, throwError, of } from 'rxjs';
import { BriefingRequest, BriefingResult } from '../models/briefing.models';
import { API_URL } from '../app.config';

interface ApiReportItem {
  queryType: string;
  reportTime?: string;
  stationId?: string;
  text?: string;
}

interface OpmetRpcResponse {
  error: null | { code: number; message: string };
  result: ApiReportItem[];
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_URL) private readonly url: string,
  ) {}

  getBriefing(request: BriefingRequest): Observable<BriefingResult> {
    const id = crypto.randomUUID();
    const body = {
      id: `query-${id}`,
      method: 'query',
      params: [
        {
          id: `briefing-${id}`,
          reportTypes: request.reportTypes,
          stations: request.airports,
          countries: request.countries,
        },
      ],
    };

    return this.http.post<OpmetRpcResponse>(this.url, body).pipe(
      switchMap(({ error, result }) => {
        if (error) {
          return throwError(() => new Error(error.message));
        }
        return of({
          reports: result.map((r) => ({
            stationId: r.stationId ?? '',
            queryType: r.queryType ?? '',
            reportTime: r.reportTime ?? '',
            text: r.text ?? '',
          })),
        });
      }),
    );
  }
}
