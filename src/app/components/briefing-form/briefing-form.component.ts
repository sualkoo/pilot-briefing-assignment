import { Component, inject, output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BriefingRequest } from '../../models/briefing.models';

const atLeastOneReportType: ValidatorFn = (
  ctrl: AbstractControl,
): ValidationErrors | null =>
  (ctrl.value as string[]).length > 0 ? null : { noReportType: true };

const locationRequired: ValidatorFn = (
  group: AbstractControl,
): ValidationErrors | null => {
  const airports = ((group.get('airportCodes')?.value as string) ?? '').trim();
  const countries = ((group.get('countryCodes')?.value as string) ?? '').trim();
  return airports || countries ? null : { locationRequired: true };
};

@Component({
  selector: 'app-briefing-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './briefing-form.component.html',
  styleUrl: './briefing-form.component.scss',
})
export class BriefingFormComponent {
  readonly briefingRequested = output<BriefingRequest>();
  readonly resetRequested = output();

  submitted = false;
  private readonly fb = inject(FormBuilder);
  form = this.fb.group(
    {
      reportTypes: [[] as string[], [atLeastOneReportType]],
      airportCodes: ['', [Validators.pattern(/^[A-Z]{4}(\s+[A-Z]{4})*$/)]],
      countryCodes: ['', [Validators.pattern(/^[A-Z]{2}(\s+[A-Z]{2})*$/)]],
    },
    { validators: locationRequired },
  );

  get reportTypesControl() {
    return this.form.get('reportTypes')!;
  }
  get airportCodesControl() {
    return this.form.get('airportCodes')!;
  }
  get countryCodesControl() {
    return this.form.get('countryCodes')!;
  }

  onCodesInput(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const pos = input.selectionStart ?? input.value.length;
    const upper = input.value.toUpperCase();
    this.form.get(controlName)?.setValue(upper, { emitEvent: false });
    requestAnimationFrame(() => input.setSelectionRange(pos, pos));
  }

  submit(): void {
    this.submitted = true;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.value;
    this.briefingRequested.emit({
      reportTypes: v.reportTypes as string[],
      airports: (v.airportCodes as string).trim().split(/\s+/).filter(Boolean),
      countries: (v.countryCodes as string).trim().split(/\s+/).filter(Boolean),
    });
  }

  reset(): void {
    this.submitted = false;
    this.form.reset({ reportTypes: [], airportCodes: '', countryCodes: '' });
    this.resetRequested.emit();
  }
}
