import { CommonModule } from '@angular/common';
import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MaskitoDirective } from '@maskito/angular';
import { maskitoTransform } from '@maskito/core';
import { ErrorMessageComponent } from '../error-message.component';
import { DebugMessage } from '../debug-mode.component';
import { CPF_MASK, unmaskCpf } from '../../masks/masks';
import { AutoAdvanceDirective } from '../../directives/auto-advance.directive';
import { SelectAllOnFocusDirective } from '../../directives/select-all-on-focus.directive';
import { BaseFormControlComponent } from './base-form-control.component';

@Component({
  selector: 'cpf-form-control',
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
      useExisting: forwardRef(() => CpfFormControlComponent),
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
        inputmode="numeric"
        [value]="displayValue"
        [id]="componentId"
        [attr.disabled]="disabled ? true : null"
        [attr.aria-invalid]="isInvalid"
        [attr.aria-required]="required"
        [attr.aria-describedby]="errorId"
        [maskito]="cpfMask"
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
export class CpfFormControlComponent extends BaseFormControlComponent implements ControlValueAccessor {
  readonly cpfMask = CPF_MASK;

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

  isFull = (el: HTMLInputElement) => el.value.length >= 14;

  private toDisplayValue(value: string): string {
    return maskitoTransform(value, this.cpfMask);
  }

  private toModelValue(display: string): string | null {
    return unmaskCpf(display) || null;
  }
}
