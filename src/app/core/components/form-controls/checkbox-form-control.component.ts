import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ErrorMessageComponent } from '../error-message.component';
import { DebugMessage } from '../debug-mode.component';
import { BaseFormControlComponent } from './base-form-control.component';

export interface CheckboxOptions {
  trueValue: any;
  falseValue: any;
}

const DEFAULT_OPTIONS: CheckboxOptions = {
  trueValue: true,
  falseValue: false,
};

@Component({
  selector: 'checkbox-form-control',
  standalone: true,
  imports: [CommonModule, ErrorMessageComponent, DebugMessage],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxFormControlComponent),
      multi: true,
    },
  ],
  host: { '[attr.data-active-filters-hide]': 'filterHideFalsy && !isChecked ? "" : null' },
  template: `
    <div class="form-group mt-3">
      <div class="form-check">
        <input
          [class.is-invalid]="isInvalid"
          type="checkbox"
          class="form-check-input"
          [name]="componentId"
          [id]="componentId"
          [checked]="isChecked"
          [disabled]="disabled"
          [attr.aria-invalid]="isInvalid"
          [attr.aria-required]="required"
          [attr.aria-describedby]="errorId"
          (change)="onCheckboxChange($event)"
          (blur)="onBlur()"
        />
        <label [for]="componentId" class="form-check-label">@if (required) {<span class="text-danger me-1" aria-hidden="true">*</span>}{{ label }}</label>
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
export class CheckboxFormControlComponent
  extends BaseFormControlComponent
  implements ControlValueAccessor
{
  @Input() options: CheckboxOptions = DEFAULT_OPTIONS;
  @Input() filterHideFalsy: boolean = true;

  isChecked: boolean = false;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  // --- CVA ---
  writeValue(value: any): void {
    this.isChecked = value === this.options.trueValue;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // --- Event handlers ---
  onCheckboxChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.isChecked = checked;
    this.onChange(checked ? this.options.trueValue : this.options.falseValue);
  }

  onBlur(): void {
    this.onTouched();
  }
}
