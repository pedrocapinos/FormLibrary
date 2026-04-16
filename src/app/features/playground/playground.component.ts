import { Component, inject, ElementRef } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { MaskitoDirective } from '@maskito/angular';
import { maskitoTransform, type MaskitoOptions } from '@maskito/core';
import { GenericHeaderComponent } from '../../core/components/generic-header.component';
import { TextFormControlComponent } from '../../core/components/form-controls/text-form-control.component';
import { CpfFormControlComponent } from '../../core/components/form-controls/cpf-form-control.component';
import { CnpjFormControlComponent } from '../../core/components/form-controls/cnpj-form-control.component';
import { PhoneFormControlComponent } from '../../core/components/form-controls/phone-form-control.component';
import { DateFormControlComponent } from '../../core/components/form-controls/date-form-control.component';
import { CodeFormControlComponent } from '../../core/components/form-controls/code-form-control.component';
import { CurrencyFormControlComponent } from '../../core/components/form-controls/currency-form-control.component';
import { SelectFormControlComponent } from '../../core/components/form-controls/select-form-control.component';
import { CheckboxFormControlComponent } from '../../core/components/form-controls/checkbox-form-control.component';
import { RangeCurrencyFormControlComponent } from '../../core/components/form-controls/range-currency-form-control.component';
import { AddressFormControlComponent } from '../../core/components/form-controls/address-form-control.component';
import { FocusOnErrorDirective } from '../../core/directives/focus-on-error.directive';
import { createRangeValidator } from '../../core/validators/range-validator';
import { createAtLeastOneRequiredValidator } from '../../core/validators/at-least-one-required-validator';
import { defineTabFilterConfig } from '../../core/types/active-filter-config';
import type { SelectOption } from '../../core/components/form-controls/select-form-control.component';
import { US_STATES } from '../../core/components/form-controls/address-form-control.component';
import { createCurrencyMask, currencyMaxValue, parseCurrencyValue, type LeadingZerosMaskConfig } from '../../core/masks/masks';
import { ActiveFiltersDialogService } from '../../core/services/active-filters-dialog.service';

const SAMPLE_SELECT_OPTIONS: SelectOption[] = [
  { value: 'angular', label: 'Angular' },
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
];

const PLAYGROUND_FILTER_CONFIG = defineTabFilterConfig([
  {
    tabId: 'text',
    tabLabel: 'Text & Masked',
    fields: {
      text:  { label: 'Text' },
      cpf:   { label: 'CPF', format: 'cpf' },
      cnpj:  { label: 'CNPJ', format: 'cnpj' },
      phone: { label: 'Phone', format: 'phone' },
      date:  { label: 'Date', format: 'date' },
    },
  },
  {
    tabId: 'numeric',
    tabLabel: 'Numeric',
    fields: {
      code:     { label: 'Code' },
      currency: { label: 'Currency', format: 'currency' },
    },
  },
  {
    tabId: 'selection',
    tabLabel: 'Selection',
    fields: {
      select:   { label: 'Select', formatter: (value) => SAMPLE_SELECT_OPTIONS.find((o) => o.value === value)?.label ?? String(value) },
      checkbox: { label: 'Accept Terms', format: 'boolean' },
    },
  },
  {
    tabId: 'compound',
    tabLabel: 'Compound',
    fields: {
      'range.rangeMin':    { label: 'Range from', format: 'currency' },
      'range.rangeMax':    { label: 'Range to',   format: 'currency' },
      'address.isPrimary': { label: 'Primary',    format: 'boolean' },
      'address.street':    { label: 'Street' },
      'address.city':      { label: 'City' },
      'address.state':     { label: 'State', formatter: (value) => US_STATES.find((s) => s.value === value)?.label ?? String(value) },
      'address.zip':       { label: 'ZIP' },
    },
  },
]);

@Component({
  selector: 'playground',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    JsonPipe,
    GenericHeaderComponent,
    TextFormControlComponent,
    CpfFormControlComponent,
    CnpjFormControlComponent,
    PhoneFormControlComponent,
    DateFormControlComponent,
    CodeFormControlComponent,
    CurrencyFormControlComponent,
    MaskitoDirective,
    SelectFormControlComponent,
    CheckboxFormControlComponent,
    RangeCurrencyFormControlComponent,
    AddressFormControlComponent,
    FocusOnErrorDirective,
  ],
  templateUrl: './playground.component.html',
})
export class PlaygroundComponent {
  private readonly fb = inject(FormBuilder);
  private readonly hostRef = inject(ElementRef);
  private readonly activeFiltersService = inject(ActiveFiltersDialogService);

  readonly filterConfig = PLAYGROUND_FILTER_CONFIG;
  readonly selectOptions = SAMPLE_SELECT_OPTIONS;

  activeTab = 'text';

  // --- Configuration state ---
  textConfig = { disabled: false, required: false, maxLength: null as number | null };
  cpfConfig = { disabled: false, required: false };
  cnpjConfig = { disabled: false, required: false };
  phoneConfig = { disabled: false, required: false };
  dateConfig = { disabled: false, required: false };
  codeConfig = { disabled: false, required: false, maxLength: 4, padded: true };
  currencyConfig = { disabled: false, required: false, fractionDigits: 2, min: null as number | null, max: null as number | null };
  selectConfig = { disabled: false, required: false, placeholder: 'Select…' };
  checkboxConfig = { disabled: false };
  rangeConfig = { fractionDigits: 2, startLabel: 'Min', endLabel: 'Max', min: null as number | null, max: null as number | null };

  // Keys for forcing component recreation when mask config changes
  codeKey = 1;
  currencyKey = 1;
  currencyConfigKey = 1;
  rangeKey = 1;
  rangeConfigKey = 1;

  // Masks for config inputs
  currencyConfigMask = this.buildConfigMask(2);
  rangeConfigMask = this.buildConfigMask(2);

  // --- Form ---
  form = this.buildForm();

  private buildForm() {
    return this.fb.group({
      text: this.fb.control<string | null>(null),
      cpf: this.fb.control<string | null>(null),
      cnpj: this.fb.control<string | null>(null),
      phone: this.fb.control<string | null>(null),
      date: this.fb.control<string | null>(null),
      code: this.fb.control<number | null>(null),
      currency: this.fb.control<number | null>(null),
      select: this.fb.control<any>(null),
      checkbox: this.fb.control<boolean>(false),
      range: this.fb.group(
        {
          rangeMin: this.fb.control<number | null>(null),
          rangeMax: this.fb.control<number | null>(null),
        },
        {
          validators: [
            createRangeValidator({ startKey: 'rangeMin', endKey: 'rangeMax', startLabel: 'Min', endLabel: 'Max' }),
          ],
        },
      ),
      address: this.fb.group(
        {
          street: this.fb.control<string | null>(null),
          city: this.fb.control<string | null>(null),
          state: this.fb.control<string | null>(null),
          zip: this.fb.control<number | null>(null),
          isPrimary: this.fb.control<boolean>(false),
        },
        {
          validators: [createAtLeastOneRequiredValidator(['street', 'city', 'state', 'zip'])],
        },
      ),
    });
  }

  get codeMaskConfig(): LeadingZerosMaskConfig {
    return { maxLength: this.codeConfig.maxLength, padded: this.codeConfig.padded };
  }

  get currencyMaxAllowed(): number {
    return currencyMaxValue(this.currencyConfig.fractionDigits);
  }

  get rangeMaxAllowed(): number {
    return currencyMaxValue(this.rangeConfig.fractionDigits);
  }

  // --- Actions ---
  onSubmit(): void {
    console.log('Playground form submitted:', this.form.getRawValue());
  }

  onClear(): void {
    this.form.reset();
    this.form = this.buildForm();
    this.applyAllDisabledStates();
    this.applyAllValidators();
  }

  onActiveFilters(): void {
    this.activeFiltersService.open(this.form, this.filterConfig, this.hostRef);
  }

  // --- Config change handlers ---
  onToggleDisabled(controlName: string, disabled: boolean): void {
    const control = this.form.get(controlName);
    if (!control) return;
    if (disabled) {
      control.disable();
    } else {
      control.enable();
    }
  }

  onToggleRequired(controlName: string, required: boolean): void {
    const control = this.form.get(controlName);
    if (!control) return;
    if (required) {
      control.addValidators(Validators.required);
    } else {
      control.removeValidators(Validators.required);
    }
    control.updateValueAndValidity();
  }

  onTextMaxLengthChange(): void {
    this.form.controls.text.reset();
  }

  onCodePaddedChange(): void {
    const value = this.form.controls.code.value;
    this.codeKey = 0;
    requestAnimationFrame(() => {
      this.codeKey = Date.now();
      requestAnimationFrame(() => {
        this.form.controls.code.setValue(value);
      });
    });
  }

  onCodeMaxLengthChange(): void {
    this.codeKey = 0;
    requestAnimationFrame(() => {
      this.codeKey = Date.now();
      requestAnimationFrame(() => {
        this.form.controls.code.reset();
      });
    });
  }

  onCurrencyFractionChange(): void {
    const fd = Math.max(0, Math.min(16, this.currencyConfig.fractionDigits ?? 2));
    this.currencyConfig.fractionDigits = fd;
    const maxAllowed = currencyMaxValue(fd);
    if (this.currencyConfig.min != null) {
      this.currencyConfig.min = Math.max(-maxAllowed, Math.min(maxAllowed, parseFloat(this.currencyConfig.min.toFixed(fd))));
    }
    if (this.currencyConfig.max != null) {
      this.currencyConfig.max = Math.max(-maxAllowed, Math.min(maxAllowed, parseFloat(this.currencyConfig.max.toFixed(fd))));
    }
    this.currencyConfigMask = this.buildConfigMask(fd);
    this.currencyKey = 0;
    this.currencyConfigKey = 0;
    requestAnimationFrame(() => {
      this.currencyKey = Date.now();
      this.currencyConfigKey = Date.now();
      requestAnimationFrame(() => {
        this.form.controls.currency.reset();
      });
    });
  }

  onRangeFractionChange(): void {
    const fd = Math.max(0, Math.min(16, this.rangeConfig.fractionDigits ?? 2));
    this.rangeConfig.fractionDigits = fd;
    const maxAllowed = currencyMaxValue(fd);
    if (this.rangeConfig.min != null) {
      this.rangeConfig.min = Math.max(-maxAllowed, Math.min(maxAllowed, parseFloat(this.rangeConfig.min.toFixed(fd))));
    }
    if (this.rangeConfig.max != null) {
      this.rangeConfig.max = Math.max(-maxAllowed, Math.min(maxAllowed, parseFloat(this.rangeConfig.max.toFixed(fd))));
    }
    this.rangeConfigMask = this.buildConfigMask(fd);
    this.rangeKey = 0;
    this.rangeConfigKey = 0;
    requestAnimationFrame(() => {
      this.rangeKey = Date.now();
      this.rangeConfigKey = Date.now();
      requestAnimationFrame(() => {
        this.form.controls.range.reset();
      });
    });
  }

  onCurrencyConfigBlur(field: 'min' | 'max', event: Event): void {
    const display = (event.target as HTMLInputElement).value;
    this.currencyConfig[field] = parseCurrencyValue(display, this.currencyConfig.fractionDigits);
    this.clampCurrencyFormValue();
    this.recreateCurrencyControls(false);
  }

  onRangeConfigBlur(field: 'min' | 'max', event: Event): void {
    const display = (event.target as HTMLInputElement).value;
    this.rangeConfig[field] = parseCurrencyValue(display, this.rangeConfig.fractionDigits);
    this.recreateRangeControls(false);
  }

  formatCurrency(value: number | null, fractionDigits: number, mask: MaskitoOptions): string {
    if (value == null) return '';
    return maskitoTransform(value.toFixed(fractionDigits).replace('.', ','), mask);
  }

  private buildConfigMask(fractionDigits: number): MaskitoOptions {
    const max = currencyMaxValue(fractionDigits);
    return createCurrencyMask(fractionDigits, -max, max);
  }

  private clampCurrencyFormValue(): void {
    const value = this.form.controls.currency.value;
    if (value == null) return;
    const { min, max } = this.currencyConfig;
    if (min != null && value < min) this.form.controls.currency.setValue(min);
    else if (max != null && value > max) this.form.controls.currency.setValue(max);
  }

  private recreateCurrencyControls(includeConfig: boolean): void {
    const value = this.form.controls.currency.value;
    this.currencyKey = 0;
    if (includeConfig) this.currencyConfigKey = 0;
    requestAnimationFrame(() => {
      this.currencyKey = Date.now();
      if (includeConfig) this.currencyConfigKey = Date.now();
      requestAnimationFrame(() => {
        this.form.controls.currency.setValue(value);
      });
    });
  }

  private recreateRangeControls(includeConfig: boolean): void {
    const rangeGroup = this.form.controls.range;
    const minVal = rangeGroup.controls.rangeMin.value;
    const maxVal = rangeGroup.controls.rangeMax.value;
    this.rangeKey = 0;
    if (includeConfig) this.rangeConfigKey = 0;
    requestAnimationFrame(() => {
      this.rangeKey = Date.now();
      if (includeConfig) this.rangeConfigKey = Date.now();
      requestAnimationFrame(() => {
        rangeGroup.controls.rangeMin.setValue(minVal);
        rangeGroup.controls.rangeMax.setValue(maxVal);
      });
    });
  }

  private applyAllDisabledStates(): void {
    const configs: Record<string, { disabled: boolean }> = {
      text: this.textConfig,
      cpf: this.cpfConfig,
      cnpj: this.cnpjConfig,
      phone: this.phoneConfig,
      date: this.dateConfig,
      code: this.codeConfig,
      currency: this.currencyConfig,
      select: this.selectConfig,
      checkbox: this.checkboxConfig,
    };
    for (const [key, cfg] of Object.entries(configs)) {
      this.onToggleDisabled(key, cfg.disabled);
    }
  }

  private applyAllValidators(): void {
    const configs: Record<string, { required?: boolean }> = {
      text: this.textConfig,
      cpf: this.cpfConfig,
      cnpj: this.cnpjConfig,
      phone: this.phoneConfig,
      date: this.dateConfig,
      code: this.codeConfig,
      currency: this.currencyConfig,
      select: this.selectConfig,
    };
    for (const [key, cfg] of Object.entries(configs)) {
      if (cfg.required) {
        this.onToggleRequired(key, true);
      }
    }
  }

}
