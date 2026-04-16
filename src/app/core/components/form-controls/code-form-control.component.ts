import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MaskitoDirective } from '@maskito/angular';
import { maskitoTransform, MaskitoOptions } from '@maskito/core';
import { ErrorMessageComponent } from '../error-message.component';
import {
  createLeadingZerosMask,
  unmaskLeadingZeros,
  LeadingZerosMaskConfig,
} from '../../masks/masks';
import { DebugMessage } from '../debug-mode.component';
import { AutoAdvanceDirective } from '../../directives/auto-advance.directive';
import { SelectAllOnFocusDirective } from '../../directives/select-all-on-focus.directive';
import { BaseFormControlComponent } from './base-form-control.component';

@Component({
  selector: 'code-form-control',
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
      useExisting: forwardRef(() => CodeFormControlComponent),
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
        [maskito]="leadingZerosMask"
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
export class CodeFormControlComponent
  extends BaseFormControlComponent
  implements ControlValueAccessor, OnInit
{
  @Input() maskConfig: LeadingZerosMaskConfig = { maxLength: 4, padded: true };

  leadingZerosMask!: MaskitoOptions;

  displayValue: string = '';
  protected onChange: (value: number | null) => void = () => {};
  protected onTouched: () => void = () => {};

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

  isFull = (el: HTMLInputElement) => el.value.length === this.maskConfig.maxLength;

  override ngOnInit(): void {
    super.ngOnInit();
    this.leadingZerosMask = createLeadingZerosMask(this.maskConfig);
  }

  private toDisplayValue(value: number): string {
    return maskitoTransform(String(value), this.leadingZerosMask);
  }

  private toModelValue(display: string): number | null {
    return unmaskLeadingZeros(display);
  }
}
