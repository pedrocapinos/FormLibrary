import { Injectable, LOCALE_ID, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { maskitoTransform } from '@maskito/core';
import { CPF_MASK, CNPJ_MASK_ALFANUMERICO, PHONE_MASK, maskDate } from '../masks/masks';

export type FormatType = 'cpf' | 'cnpj' | 'currency' | 'date' | 'boolean' | 'phone' | 'text';

export interface FormatOptions {
  currencyCode?: string;
  display?: 'code' | 'symbol' | 'symbol-narrow' | 'string' | boolean;
  digitsInfo?: string;
  trueLabel?: string;
  falseLabel?: string;
  defaultFallback?: string;
}

@Injectable({ providedIn: 'root' })
export class FormatService {
  private readonly locale = inject(LOCALE_ID);
  private readonly currencyPipe = new CurrencyPipe(this.locale);

  format(value: any, type?: FormatType, options?: FormatOptions): string {
    const fallback = options?.defaultFallback ?? '—';
    if (value === null || value === undefined || value === '') return fallback;

    switch (type) {
      case 'cpf':
        return maskitoTransform(String(value), CPF_MASK);
      case 'cnpj':
        return maskitoTransform(String(value), CNPJ_MASK_ALFANUMERICO);
      case 'phone':
        return maskitoTransform(String(value), PHONE_MASK);
      case 'date':
        return maskDate(String(value));
      case 'currency':
        return (
          this.currencyPipe.transform(
            value,
            options?.currencyCode ?? 'BRL',
            options?.display ?? 'symbol-narrow',
            options?.digitsInfo
          ) ?? fallback
        );
      case 'boolean':
        return value ? (options?.trueLabel ?? 'Yes') : (options?.falseLabel ?? 'No');
      default:
        return String(value);
    }
  }
}
