import { Component, effect, inject, input, LOCALE_ID } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import {
  BriefingResult,
  GroupRow,
  TableRow,
  TextSegment,
  WeatherReport,
} from '../../models/briefing.models';
import { APP_TIMEZONE } from '../../app.config';

@Component({
  selector: 'app-briefing-result',
  imports: [
    MatTableModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './briefing-result.component.html',
  styleUrl: './briefing-result.component.scss',
})
export class BriefingResultComponent {
  readonly result = input<BriefingResult | null>(null);
  readonly loading = input(false);

  private readonly locale = inject(LOCALE_ID);
  private readonly timezone = inject(APP_TIMEZONE);
  tableData: TableRow[] = [];
  readonly displayedColumns = ['queryType', 'reportTime', 'text'];

  private allReports: WeatherReport[] = [];
  totalReports = 0;
  pageSize = 10;
  pageIndex = 0;
  readonly pageSizeOptions = [5, 10, 25, 50];

  constructor() {
    effect(() => {
      this.result();
      this.pageIndex = 0;
      this.buildTableData();
    });
  }

  onPage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.buildTableData();
  }

  isGroup(_index: number, row: TableRow): boolean {
    return (row as GroupRow).isGroup === true;
  }

  formatTime(isoString: string): string {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleString(this.locale, {
      timeZone: this.timezone,
    });
  }

  getTextSegments(text: string): TextSegment[] {
    const segments: TextSegment[] = [];
    const pattern = /(?:BKN|FEW|SCT)\d{3}/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({
          text: text.slice(lastIndex, match.index),
          color: null,
        });
      }
      const value = Number.parseInt(match[0].slice(-3), 10);
      segments.push({
        text: match[0],
        color: value <= 30 ? 'cloud-blue' : 'cloud-red',
      });
      lastIndex = pattern.lastIndex;
    }
    if (lastIndex < text.length) {
      segments.push({ text: text.slice(lastIndex), color: null });
    }
    return segments;
  }

  private buildTableData(): void {
    const result = this.result();
    if (!result) {
      this.allReports = [];
      this.totalReports = 0;
      this.tableData = [];
      return;
    }

    this.allReports = result.reports;
    this.totalReports = this.allReports.length;

    const start = this.pageIndex * this.pageSize;
    const pageReports = this.groupByStation(this.allReports).slice(
      start,
      start + this.pageSize,
    );

    this.tableData = this.buildRows(pageReports);
  }

  private groupByStation(reports: WeatherReport[]): WeatherReport[] {
    const grouped = new Map<string, WeatherReport[]>();
    for (const r of reports) {
      if (!grouped.has(r.stationId)) {
        grouped.set(r.stationId, []);
      }
      grouped.get(r.stationId)!.push(r);
    }
    return Array.from(grouped.values()).flat();
  }

  private buildRows(reports: WeatherReport[]): TableRow[] {
    const rows: TableRow[] = [];
    let currentStation = '';
    for (const r of reports) {
      if (r.stationId !== currentStation) {
        rows.push({ isGroup: true, stationId: r.stationId });
        currentStation = r.stationId;
      }
      rows.push(r);
    }
    return rows;
  }
}
