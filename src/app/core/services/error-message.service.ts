import { Injectable } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

export type MessageFactory = (label: string, params?: any) => string;

export interface ErrorMessageConfig {
  required: MessageFactory;
  minlength: MessageFactory;
  maxlength: MessageFactory;
  min: MessageFactory;
  max: MessageFactory;
  pattern: MessageFactory;
  rangeInvalid: MessageFactory;
  atLeastOneRequired: MessageFactory;
  [key: string]: MessageFactory;
}

const DEFAULT_MESSAGES: ErrorMessageConfig = {
  required: (label) => `${label} is required`,
  minlength: (label, p) => `${label} must be at least ${p?.requiredLength} characters`,
  maxlength: (label, p) => `${label} must not exceed ${p?.requiredLength} characters`,
  min: (label, p) => `${label} must be at least ${p?.min}`,
  max: (label, p) => `${label} must not exceed ${p?.max}`,
  pattern: (label) => `${label} format is invalid`,
  rangeInvalid: (label, p) =>
    p?.otherLabel ? `${label} cannot exceed ${p.otherLabel}` : `${label} range is invalid`,
  atLeastOneRequired: (label) => `At least one ${label} field is required`,
};

@Injectable({ providedIn: 'root' })
export class ErrorMessageService {
  private config: ErrorMessageConfig = { ...DEFAULT_MESSAGES };

  configure(overrides: Partial<ErrorMessageConfig>): void {
    for (const [key, factory] of Object.entries(overrides)) {
      if (factory) this.config[key] = factory;
    }
  }

  resolve(
    errors: ValidationErrors,
    label: string,
    customMessages?: Partial<ErrorMessageConfig>
  ): string {
    for (const key of Object.keys(errors)) {
      const factory = customMessages?.[key] ?? this.config[key];
      if (factory) {
        const params = errors[key] === true ? undefined : errors[key];
        return factory(label, params);
      }
    }
    return 'Invalid field';
  }
}
