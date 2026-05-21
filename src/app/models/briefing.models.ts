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
