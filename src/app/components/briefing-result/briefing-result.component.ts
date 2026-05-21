import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BriefingResult, WeatherReport } from '../../models/briefing.models';

interface GroupRow {
  isGroup: true;
  stationId: string;
}

interface TextSegment {
  text: string;
  color: 'cloud-blue' | 'cloud-red' | null;
}

type TableRow = WeatherReport | GroupRow;

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
export class BriefingResultComponent implements OnChanges {
  @Input() result: BriefingResult | null = null;
  @Input() loading = false;

  tableData: TableRow[] = [];
  readonly displayedColumns = ['queryType', 'reportTime', 'text'];

  private allReports: WeatherReport[] = [];
  totalReports = 0;
  pageSize = 10;
  pageIndex = 0;
  readonly pageSizeOptions = [5, 10, 25, 50];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['result']) {
      this.pageIndex = 0;
    }
    this.buildTableData();
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
    return new Date(isoString).toLocaleString('sk-SK', {
      timeZone: 'Europe/Bratislava',
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
    if (!this.result) {
      this.allReports = [];
      this.totalReports = 0;
      this.tableData = [];
      return;
    }
    this.allReports = this.result.reports;
    this.totalReports = this.allReports.length;

    const start = this.pageIndex * this.pageSize;
    const pageReports = this.allReports.slice(start, start + this.pageSize);

    const grouped = new Map<string, WeatherReport[]>();
    for (const r of pageReports) {
      if (!grouped.has(r.stationId)) {
        grouped.set(r.stationId, []);
      }
      grouped.get(r.stationId)!.push(r);
    }
    const rows: TableRow[] = [];
    for (const [stationId, reports] of grouped) {
      rows.push({ isGroup: true, stationId }, ...reports);
    }
    this.tableData = rows;
  }
}
