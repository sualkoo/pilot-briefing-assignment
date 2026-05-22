export interface WeatherReport {
  stationId: string;
  queryType: string;
  reportTime: string;
  text: string;
}

export interface BriefingRequest {
  reportTypes: string[];
  airports: string[];
  countries: string[];
}

export interface BriefingResult {
  reports: WeatherReport[];
}

export interface GroupRow {
  isGroup: true;
  stationId: string;
}

export interface TextSegment {
  text: string;
  color: 'cloud-blue' | 'cloud-red' | null;
}

export type TableRow = WeatherReport | GroupRow;
