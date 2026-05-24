import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
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
  error = signal<string | null>(null);

  private readonly destroyRef = inject(DestroyRef);
  private readonly weatherService = inject(WeatherService);

  onBriefingRequested(request: BriefingRequest): void {
    this.clearState(true);
    this.weatherService
      .getBriefing(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.result.set(data);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          let message: string;
          if (err instanceof HttpErrorResponse) {
            message = `Request failed — HTTP ${err.status}`;
          } else if (err instanceof Error) {
            message = err.message;
          } else {
            message = 'An unexpected error occurred. Please try again.';
          }
          this.error.set(message);
          this.loading.set(false);
        },
      });
  }

  onResetRequested(): void {
    this.clearState();
  }

  private clearState(loading = false): void {
    this.result.set(null);
    this.error.set(null);
    this.loading.set(loading);
  }
}
