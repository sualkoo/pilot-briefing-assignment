import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { BriefingRequest, BriefingResult } from '../models/briefing.models';

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
  private readonly url = 'https://ogcie.iblsoft.com/ria/opmetquery';
  private requestCounter = 0;

  constructor(private readonly http: HttpClient) {}

  getBriefing(request: BriefingRequest): Observable<BriefingResult> {
    const id = ++this.requestCounter;
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
      map(({ result }) => ({
        reports: result.map((r) => ({
          stationId: r.stationId ?? '',
          queryType: r.queryType ?? '',
          reportTime: r.reportTime ?? '',
          text: r.text ?? '',
        })),
      })),
    );
  }
}
