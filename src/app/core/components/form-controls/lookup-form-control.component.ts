import { CommonModule } from '@angular/common';
import { Component, DestroyRef, forwardRef, inject, Input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MaskitoDirective } from '@maskito/angular';
import { maskitoTransform, MaskitoOptions } from '@maskito/core';
import { Observable, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ErrorMessageComponent } from '../error-message.component';
import { DebugMessage } from '../debug-mode.component';
import { BaseFormControlComponent } from './base-form-control.component';
import {
  createLeadingZerosMask,
  unmaskLeadingZeros,
  LeadingZerosMaskConfig,
} from '../../masks/masks';
import { SelectAllOnFocusDirective } from '../../directives/select-all-on-focus.directive';

export interface LookupValue {
  id: number | null;
  display: string | null;
}

function normalizeLookupValue(value: LookupValue | null): LookupValue | null {
  if (!value) return null;
  if (value.id == null && value.display == null) return null;
  return value;
}

@Component({
  selector: 'lookup-form-control',
  standalone: true,
  imports: [CommonModule, ErrorMessageComponent, DebugMessage, MaskitoDirective, SelectAllOnFocusDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LookupFormControlComponent),
      multi: true,
    },
  ],
  template: `
    <div class="form-group mt-3">
      <label [for]="componentId" class="form-label">
        @if (required) {
          <span class="text-danger me-1" aria-hidden="true">*</span>
        }
        {{ label }}
      </label>
      <div class="input-group input-group-sm">
        <input
          type="text"
          class="form-control"
          [class.is-invalid]="isInvalid"
          inputmode="numeric"
          [value]="displayId"
          [id]="componentId"
          [attr.disabled]="disabled ? true : null"
          [attr.aria-invalid]="isInvalid"
          [attr.aria-required]="required"
          [attr.aria-describedby]="errorId"
          [placeholder]="idPlaceholder"
          [maskito]="idMask"
          selectAllOnFocus
          style="max-width: 100px"
          (input)="onIdInput($event)"
          (blur)="onIdBlur()"
        />
        <button
          type="button"
          class="btn btn-secondary"
          [disabled]="disabled"
          [attr.aria-label]="'Search ' + label"
          (click)="onSearch()"
        >
          <i class="bi bi-search"></i>
        </button>
        <input
          type="text"
          class="form-control"
          [value]="displayName"
          [placeholder]="placeholder"
          disabled
        />
        <button
          type="button"
          class="btn btn-outline-secondary"
          [disabled]="disabled || value === null"
          [attr.aria-label]="'Clear ' + label"
          (click)="onClear()"
        >
          <i class="bi bi-x-lg"></i>
        </button>
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
export class LookupFormControlComponent
  extends BaseFormControlComponent
  implements ControlValueAccessor
{
  private readonly destroyRef = inject(DestroyRef);

  @Input() lookupFn!: () => Observable<LookupValue | null>;
  @Input() lookupByIdFn?: (id: number) => Observable<string | null>;
  @Input() placeholder = 'No selection';
  @Input() idPlaceholder = 'ID';
  @Input() idMaskConfig: LeadingZerosMaskConfig = { maxLength: 4, padded: true };

  value: LookupValue | null = null;
  displayId = '';

  private _idMask?: MaskitoOptions;
  private readonly idLookup$ = new Subject<number>();

  protected onChange: (value: LookupValue | null) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    super();
    this.idLookup$
      .pipe(
        switchMap((id) =>
          this.lookupByIdFn!(id).pipe(map((display) => ({ id, display }))),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ id, display }) => {
        if (display !== null) {
          this.value = { id, display };
        } else {
          this.value = null;
          this.displayId = '';
        }
        this.onChange(this.value);
        this.onTouched();
      });
  }

  get displayName(): string {
    return this.value?.display ?? '';
  }

  get idMask(): MaskitoOptions {
    return (this._idMask ??= createLeadingZerosMask(this.idMaskConfig));
  }

  writeValue(value: LookupValue | null): void {
    this.value = normalizeLookupValue(value);
    this.displayId = this.formatDisplayId(this.value?.id);
  }

  private formatDisplayId(id: number | null | undefined): string {
    return id != null ? maskitoTransform(String(id), this.idMask) : '';
  }

  registerOnChange(fn: (value: LookupValue | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onIdInput(event: Event): void {
    this.displayId = (event.target as HTMLInputElement).value;
  }

  onIdBlur(): void {
    const numericId = unmaskLeadingZeros(this.displayId);

    if (numericId === null) {
      if (this.value !== null) {
        this.value = null;
        this.onChange(null);
      }
      this.onTouched();
      return;
    }

    if (numericId === this.value?.id) {
      this.onTouched();
      return;
    }

    if (!this.lookupByIdFn) {
      this.value = { id: numericId, display: null };
      this.onChange(this.value);
      this.onTouched();
      return;
    }

    this.idLookup$.next(numericId);
  }

  onSearch(): void {
    this.lookupFn().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (result) {
        this.value = result;
        this.displayId = this.formatDisplayId(result.id);
        this.onChange(this.value);
      }
      this.onTouched();
    });
  }

  onClear(): void {
    this.value = null;
    this.displayId = '';
    this.onChange(null);
    this.onTouched();
  }

}
