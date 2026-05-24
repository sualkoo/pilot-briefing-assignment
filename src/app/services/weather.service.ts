import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  BriefingRequest,
  BriefingResult,
  WeatherReport,
} from '../models/briefing.models';
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
  private readonly http = inject(HttpClient);
  private readonly url = inject(API_URL);

  getBriefing(request: BriefingRequest): Observable<BriefingResult> {
    return this.http
      .post<OpmetRpcResponse>(this.url, this.buildRequestBody(request))
      .pipe(
        map(({ error, result }) => {
          if (error) throw new Error(error.message);
          return { reports: result.map(toWeatherReport) };
        }),
      );
  }

  private buildRequestBody(request: BriefingRequest) {
    const id = crypto.randomUUID();
    return {
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
  }
}

function toWeatherReport(r: ApiReportItem): WeatherReport {
  return {
    stationId: r.stationId ?? '',
    queryType: r.queryType ?? '',
    reportTime: r.reportTime ?? '',
    text: r.text ?? '',
  };
}
