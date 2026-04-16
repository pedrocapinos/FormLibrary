import { Component, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ErrorMessageComponent } from '../error-message.component';
import { DebugMessage } from '../debug-mode.component';
import { BaseFormControlComponent } from './base-form-control.component';

export interface SelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'select-form-control',
  standalone: true,
  imports: [ErrorMessageComponent, DebugMessage],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectFormControlComponent),
      multi: true,
    },
  ],
  template: `
    <div class="form-group mt-3">
      <label [for]="componentId" class="form-label">@if (required) {<span class="text-danger me-1" aria-hidden="true">*</span>}{{ label }}</label>
      <select
        class="form-select form-select-sm"
        [id]="componentId"
        [class.is-invalid]="isInvalid"
        [disabled]="disabled"
        [attr.aria-invalid]="isInvalid"
        [attr.aria-required]="required"
        [attr.aria-describedby]="errorId"
        (change)="onSelectionChange($event)"
        (blur)="onBlur()"
      >
        <option value="" disabled [selected]="selectedIndex === -1">{{ placeholder }}</option>
        @for (option of options; track option.value; let i = $index) {
          <option [value]="i" [selected]="i === selectedIndex">{{ option.label }}</option>
        }
      </select>
      <error-message
        [id]="errorId"
        [control]="outerControl"
        [label]="label"
        [customMessages]="customMessages"
      />
      @if (debugMode) {
        <debug-message [control]="outerControl ?? undefined" />
      }
    </div>
  `,
})
export class SelectFormControlComponent
  extends BaseFormControlComponent
  implements ControlValueAccessor, OnChanges
{
  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = 'Select…';

  selectedIndex: number = -1;

  private lastWrittenValue: any = undefined;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && this.lastWrittenValue !== undefined) {
      this.selectedIndex = this.options.findIndex((o) => o.value === this.lastWrittenValue);
    }
  }

  // --- CVA ---
  writeValue(value: any): void {
    this.lastWrittenValue = value;
    this.selectedIndex = this.options.findIndex((o) => o.value === value);
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
  onSelectionChange(event: Event): void {
    const index = Number((event.target as HTMLSelectElement).value);
    if (!isNaN(index) && index >= 0 && index < this.options.length) {
      this.selectedIndex = index;
      this.onChange(this.options[index].value);
    } else {
      this.selectedIndex = -1;
      this.onChange(null);
    }
  }

  onBlur(): void {
    this.onTouched();
  }
}
