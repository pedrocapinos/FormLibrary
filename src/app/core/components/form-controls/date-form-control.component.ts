import { CommonModule } from '@angular/common';
import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MaskitoDirective } from '@maskito/angular';
import { MaskitoOptions } from '@maskito/core';
import { maskitoDateOptionsGenerator } from '@maskito/kit';
import { ErrorMessageComponent } from '../error-message.component';
import { DebugMessage } from '../debug-mode.component';
import { unmaskDate, maskDate } from '../../masks/masks';
import { AutoAdvanceDirective } from '../../directives/auto-advance.directive';
import { SelectAllOnFocusDirective } from '../../directives/select-all-on-focus.directive';
import { BaseFormControlComponent } from './base-form-control.component';

@Component({
  selector: 'date-form-control',
  standalone: true,
  imports: [
    CommonModule,
    ErrorMessageComponent,
    DebugMessage,
    MaskitoDirective,
    AutoAdvanceDirective,
    SelectAllOnFocusDirective,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateFormControlComponent),
      multi: true,
    },
  ],
  template: `
    <div class="form-group mt-3">
      <label [for]="componentId" class="form-label">@if (required) {<span class="text-danger me-1" aria-hidden="true">*</span>}{{ label }}</label>
      <div class="input-group input-group-sm">
        <input
          class="form-control form-control-sm"
          [class.is-invalid]="isInvalid"
          [value]="displayValue"
          [id]="componentId"
          [attr.disabled]="disabled ? true : null"
          [attr.aria-invalid]="isInvalid"
          [attr.aria-required]="required"
          [attr.aria-describedby]="errorId"
          [maskito]="dateOptions"
          [autoAdvance]="isFull"
          selectAllOnFocus
          (input)="onInput($event)"
          (blur)="onBlur()"
        />
        <span class="input-group-text">
          <i class="bi bi-calendar" aria-hidden="true"></i>
        </span>
      </div>
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
export class DateFormControlComponent
  extends BaseFormControlComponent
  implements ControlValueAccessor
{
  displayValue: string = '';
  protected onChange: (value: string | null) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.displayValue = value != null ? this.toDisplayValue(value) : '';
  }
  registerOnChange(fn: (value: string | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onInput(event: Event): void {
    this.displayValue = (event.target as HTMLInputElement).value;
    this.onChange(this.toModelValue(this.displayValue));
  }
  onBlur(): void { this.onTouched(); }

  isFull = (el: HTMLInputElement) => el.value.length >= 10;

  readonly dateOptions: MaskitoOptions = maskitoDateOptionsGenerator({
    mode: 'dd/mm/yyyy',
    separator: '/',
    min: new Date('1900-01-01'),
    max: new Date('2500-12-31'),
  });

  private toDisplayValue(value: string): string {
    return maskDate(value);
  }

  private toModelValue(display: string): string | null {
    return unmaskDate(display) || null;
  }
}
