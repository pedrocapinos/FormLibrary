import { CommonModule } from '@angular/common';
import { Component, inject, Input, SkipSelf } from '@angular/core';
import { ControlContainer, ReactiveFormsModule } from '@angular/forms';
import { CurrencyFormControlComponent } from './currency-form-control.component';
import { ErrorMessageComponent } from '../error-message.component';
import type { ErrorMessageConfig } from '../../services/error-message.service';
import { DebugService } from '../../services/debug.service';

/**
 * Range currency pair that participates in the parent reactive form via ControlContainer.
 *
 * The consumer declares two sibling controls on their form and places the range
 * validator directly on that same form (or sub-group). This component binds to those
 * controls by name and reads range errors from the injected parent ControlContainer.
 *
 * ```typescript
 * readonly form = new FormGroup(
 *   {
 *     salaryMin: new FormControl(null),
 *     salaryMax: new FormControl(null),
 *   },
 *   { validators: [createRangeValidator({ startKey: 'salaryMin', endKey: 'salaryMax',
 *                                         startLabel: 'Min Salary', endLabel: 'Max Salary' })] },
 * );
 * ```
 *
 * ```html
 * <range-currency-form-control
 *   startControlName="salaryMin" endControlName="salaryMax"
 *   startLabel="Min Salary" endLabel="Max Salary">
 * </range-currency-form-control>
 * ```
 */
@Component({
  selector: 'range-currency-form-control',
  standalone: true,
  host: { 'data-group-validator': 'true' },
  imports: [CommonModule, ReactiveFormsModule, CurrencyFormControlComponent, ErrorMessageComponent],
  template: `
    <div class="row g-2" role="group" [attr.aria-label]="startLabel + ' to ' + endLabel">
      <div class="col-md-6">
        <currency-form-control
          [fieldId]="startFieldId"
          [formControlName]="startControlName"
          [label]="startLabel"
          [groupInvalid]="groupInvalid"
          [fractionDigits]="fractionDigits"
          [min]="min"
          [max]="max"
        >
        </currency-form-control>
      </div>
      <div class="col-md-6">
        <currency-form-control
          [fieldId]="endFieldId"
          [formControlName]="endControlName"
          [label]="endLabel"
          [groupInvalid]="groupInvalid"
          [fractionDigits]="fractionDigits"
          [min]="min"
          [max]="max"
        >
        </currency-form-control>
      </div>
    </div>
    <error-message
      [id]="errorId"
      [control]="controlContainer.control"
      [label]="startLabel"
      [customMessages]="customMessages"
    >
    </error-message>
  `,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: (container: ControlContainer) => container,
      deps: [[new SkipSelf(), ControlContainer]],
    },
  ],
})
export class RangeCurrencyFormControlComponent {
  @Input() startControlName!: string;
  @Input() endControlName!: string;
  @Input() startLabel = 'Start';
  @Input() endLabel = 'End';
  @Input() startFieldId?: string;
  @Input() endFieldId?: string;
  @Input() fractionDigits = 2;
  @Input() min?: number;
  @Input() max?: number;
  @Input() customMessages?: Partial<ErrorMessageConfig>;

  private readonly debugService = inject(DebugService);
  get debugMode(): boolean {
    return this.debugService.enabled;
  }

  private generatedId = `range-${Math.random().toString(36).slice(2)}`;

  constructor(readonly controlContainer: ControlContainer) {}

  get errorId(): string {
    return (this.startFieldId ?? this.generatedId) + '-range-error';
  }

  get groupInvalid(): boolean {
    const control = this.controlContainer.control;
    if (!control) return false;
    return control.hasError('rangeInvalid') && (control.dirty || control.touched);
  }
}
