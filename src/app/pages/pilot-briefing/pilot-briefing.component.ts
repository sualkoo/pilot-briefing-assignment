import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { WeatherService } from '../../services/weather.service';
import { BriefingFormComponent } from '../../components/briefing-form/briefing-form.component';
import { BriefingResultComponent } from '../../components/briefing-result/briefing-result.component';
import { BriefingRequest, BriefingResult } from '../../models/briefing.models';

@Component({
  selector: 'app-pilot-briefing',
  imports: [MatIconModule, BriefingFormComponent, BriefingResultComponent],
  templateUrl: './pilot-briefing.component.html',
  styleUrl: './pilot-briefing.component.scss',
})
export class PilotBriefingComponent {
  result = signal<BriefingResult | null>(null);
  loading = signal(false);

  constructor(private readonly weatherService: WeatherService) {}

  onBriefingRequested(request: BriefingRequest): void {
    this.loading.set(true);
    this.result.set(null);
    this.weatherService.getBriefing(request).subscribe({
      next: (data) => {
        this.result.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onResetRequested(): void {
    this.result.set(null);
    this.loading.set(false);
  }
}
