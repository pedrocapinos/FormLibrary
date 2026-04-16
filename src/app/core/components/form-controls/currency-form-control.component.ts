import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MaskitoDirective } from '@maskito/angular';
import { maskitoTransform, MaskitoOptions } from '@maskito/core';
import { ErrorMessageComponent } from '../error-message.component';
import { DebugMessage } from '../debug-mode.component';
import { createCurrencyMask, currencyMaxValue, parseCurrencyValue } from '../../masks/masks';
import { AutoAdvanceDirective } from '../../directives/auto-advance.directive';
import { SelectAllOnFocusDirective } from '../../directives/select-all-on-focus.directive';
import { BaseFormControlComponent } from './base-form-control.component';

@Component({
  selector: 'currency-form-control',
  standalone: true,
  imports: [
    CommonModule,
    ErrorMessageComponent,
    MaskitoDirective,
    DebugMessage,
    AutoAdvanceDirective,
    SelectAllOnFocusDirective,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyFormControlComponent),
      multi: true,
    },
  ],
  template: `
    <div class="form-group mt-3">
      <label [for]="componentId" class="form-label">@if (required) {<span class="text-danger me-1" aria-hidden="true">*</span>}{{ label }}</label>
      <input
        [class.is-invalid]="isInvalid"
        class="form-control form-control-sm"
        type="text"
        [value]="displayValue"
        [id]="componentId"
        [attr.disabled]="disabled ? true : null"
        [attr.aria-invalid]="isInvalid"
        [attr.aria-required]="required"
        [attr.aria-describedby]="errorId"
        [maskito]="currencyMask"
        [autoAdvance]="isFull"
        selectAllOnFocus
        (input)="onInput($event)"
        (blur)="onBlur()"
      />
      <error-message
        [id]="errorId"
        [control]="outerControl"
        [label]="label"
        [customMessages]="customMessages"
      ></error-message>
      <debug-message *ngIf="debugMode" [control]="outerControl ?? undefined"></debug-message>
    </div>
  `,
})
export class CurrencyFormControlComponent
  extends BaseFormControlComponent
  implements ControlValueAccessor, OnInit
{
  @Input() fractionDigits = 2;
  @Input() min?: number;
  @Input() max?: number;

  currencyMask!: MaskitoOptions;

  displayValue: string = '';
  protected onChange: (value: number | null) => void = () => {};
  protected onTouched: () => void = () => {};

  override ngOnInit(): void {
    super.ngOnInit();
    const defaultMax = currencyMaxValue(this.fractionDigits);
    this.currencyMask = createCurrencyMask(
      this.fractionDigits,
      this.min ?? -defaultMax,
      this.max ?? defaultMax,
    );
  }

  writeValue(value: number | null): void {
    this.displayValue = value != null ? this.toDisplayValue(value) : '';
  }
  registerOnChange(fn: (value: number | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onInput(event: Event): void {
    this.displayValue = (event.target as HTMLInputElement).value;
    this.onChange(this.toModelValue(this.displayValue));
  }
  onBlur(): void { this.onTouched(); }

  isFull = (el: HTMLInputElement) => {
    const sepIndex = el.value.lastIndexOf(',');
    return sepIndex >= 0 && el.value.length - sepIndex - 1 >= this.fractionDigits;
  };

  private toDisplayValue(value: number): string {
    return maskitoTransform(value.toFixed(this.fractionDigits).replace('.', ','), this.currencyMask);
  }

  private toModelValue(display: string): number | null {
    return parseCurrencyValue(display, this.fractionDigits);
  }
}
