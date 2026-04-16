import {
  MaskitoOptions,
  MaskitoPostprocessor,
  MaskitoPlugin,
  MaskitoPreprocessor,
} from '@maskito/core';
import {
  maskitoNumberOptionsGenerator,
  MaskitoNumberParams,
  maskitoParseNumber,
} from '@maskito/kit';

// Phone mask: (0-9).
// Shape: DDD-DDDDD-DDDD
export const PHONE_MASK: MaskitoOptions = {
  mask: [/\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
};

export const unmaskPhone = (value: string): string => (value ? value.replace(/\D/g, '') : '');

// CPF mask: (0-9).
// Shape: XXX.XXX.XXX-XX
export const CPF_MASK: MaskitoOptions = {
  mask: [/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/],
};

// Function to remove all non-digit characters from a string
export const unmaskCpf = (value: string): string => {
  return value ? value.replace(/\D/g, '') : '';
};

const maskitoCurrencyParams: MaskitoNumberParams = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  thousandSeparator: '.',
  decimalSeparator: ',',
};

export const CURRENCY_MASK: MaskitoOptions = maskitoNumberOptionsGenerator(maskitoCurrencyParams);

export const unmaskCurrency = (value: string): number | null => {
  const result = maskitoParseNumber(value, maskitoCurrencyParams);
  return Number.isNaN(result) ? null : result;
};

/**
 * Maximum value where every 10^(-fractionDigits) step produces a distinct float.
 *
 * IEEE 754 doubles have 52 mantissa bits, so the unit in the last place (ULP)
 * at value v is 2^(floor(log2(v)) - 52).  For fd decimal places, the step size
 * is 10^(-fd).  We need ULP < step, which gives:
 *
 *   floor(log2(v)) < 52 - fd · log2(10)
 *
 * The largest v that satisfies this is 2^(E+1) - 10^(-fd), where
 * E = floor(52 - fd · log2(10)).  This ensures no two adjacent decimal values
 * alias to the same float.
 */
export function currencyMaxValue(fractionDigits: number): number {
  const exponentLimit = Math.floor(52 - fractionDigits * Math.log2(10));
  return Math.pow(2, exponentLimit + 1) - Math.pow(10, -fractionDigits);
}

export function createCurrencyMask(fractionDigits: number, min: number, max: number): MaskitoOptions {
  return maskitoNumberOptionsGenerator({
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
    thousandSeparator: '.',
    decimalSeparator: ',',
    min,
    max,
  });
}

export function parseCurrencyValue(value: string, fractionDigits: number): number | null {
  const result = maskitoParseNumber(value, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
    thousandSeparator: '.',
    decimalSeparator: ',',
  });
  return Number.isNaN(result) ? null : result;
}

/**
 * Converts a display date (dd/MM/yyyy) to ISO format (yyyy-MM-dd).
 * Returns null for incomplete or empty values.
 */
export const unmaskDate = (displayValue: string): string | null => {
  if (!displayValue || displayValue.length < 10) return null;
  const parts = displayValue.split('/');
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts;
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Converts an ISO date (yyyy-MM-dd) to display format (dd/MM/yyyy).
 */
export const maskDate = (modelValue: string): string => {
  if (!modelValue) return '';
  const parts = modelValue.split('-');
  if (parts.length !== 3) return modelValue;
  const [yyyy, mm, dd] = parts;
  return `${dd}/${mm}/${yyyy}`;
};

/**
 * CNPJ mask: (A-Z, 0-9).
 * Shape: AA.AAA.AAA/AAAA-DV
 * Uses a preprocessor to force all letters to uppercase.
 */
export const CNPJ_MASK_ALFANUMERICO: MaskitoOptions = {
  mask: [
    /[A-Z0-9]/,
    /[A-Z0-9]/,
    '.',
    /[A-Z0-9]/,
    /[A-Z0-9]/,
    /[A-Z0-9]/,
    '.',
    /[A-Z0-9]/,
    /[A-Z0-9]/,
    /[A-Z0-9]/,
    '/',
    /[A-Z0-9]/,
    /[A-Z0-9]/,
    /[A-Z0-9]/,
    /[A-Z0-9]/,
    '-',
    /\d/,
    /\d/,
  ],
  /**
   * Forces character input to uppercase,
   * following the rule "uppercase letters from A to Z".
   */
  preprocessors: [({ elementState, data }) => ({ elementState, data: data.toUpperCase() })],
};

/**
 * Unmask function for the Alphanumeric CNPJ.
 * Removes all formatting characters (., /, -) and
 * any other non-alphanumeric characters.
 * @param value The masked value (e.g., "A1.B2C.3D4/0001-G7")
 * @returns The raw value (e.g., "A1B2C3D40001G7")
 */
export const unmaskCnpjAlfanumerico = (value: string): string => {
  // Uses regex to remove everything that is NOT (^) a letter (a-z, A-Z) or digit (0-9).
  // The 'g' (global) flag ensures all occurrences are replaced.
  return value ? value.replace(/[^A-Z0-9]/g, '') : '';
};

/**
 * Unmask function for leading zeros mask
 * Removes leading zeros but keeps at least one digit
 * @param value The masked value (e.g., "0012")
 * @returns The unmasked value (e.g., "12" or "0" for all zeros)
 */
export const unmaskLeadingZeros = (value: string): number | null => {
  if (!value) return null;

  const trimmed = value.replace(/^0+(?=\d)/, '');
  const parsed = parseInt(trimmed, 10);

  return Number.isNaN(parsed) ? null : parsed;
};

/** Keep digits only */
const digitsOnlyPreprocessor: MaskitoPreprocessor = ({ elementState, data }) => ({
  elementState,
  data: data.replace(/\D/g, ''),
});

/** Block insertion when field is full and cursor is collapsed */
function createBlockWhenFullPreprocessor(maxLength: number): MaskitoPreprocessor {
  return ({ elementState, data }, actionType) => {
    const { value, selection } = elementState;
    const [from, to] = selection;
    if (actionType === 'insert' && from === to && value.length >= maxLength) {
      return { elementState, data: '' };
    }
    return { elementState, data };
  };
}

/** Clear all zeros on backspace - Plugin approach */
function createClearAllZerosPlugin(maxLength: number): MaskitoPlugin {
  return (element) => {
    const listener = (event: Event) => {
      const inputEvent = event as InputEvent;

      // Only handle backspace/delete
      if (inputEvent.inputType !== 'deleteContentBackward') {
        return;
      }

      const input = element as HTMLInputElement;
      const { value, selectionStart, selectionEnd } = input;

      // Check if the current value is all zeros and cursor is at the end
      const isAllZeros = /^0+$/.test(value);
      const isFullLength = value.length === maxLength;
      const cursorAtEnd = selectionStart === value.length && selectionEnd === value.length;

      if (isAllZeros && isFullLength && cursorAtEnd) {
        // Prevent default backspace behavior
        event.preventDefault();

        // Manually clear the field
        input.value = '';
        input.setSelectionRange(0, 0);

        // Trigger input event so Angular's ngModel updates
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };

    // Listen to beforeinput event (fires before the value changes)
    element.addEventListener('beforeinput', listener);

    // Return cleanup function
    return () => {
      element.removeEventListener('beforeinput', listener);
    };
  };
}

/** Focus-aware padding: pads programmatic values immediately, user input only on blur */
function createPaddingWithBlur(maxLength: number) {
  let isFocused = false;

  const postprocessor: MaskitoPostprocessor = ({ value, selection }) => {
    if (value === '' || isFocused) return { value, selection };
    const padded = value.slice(0, maxLength).padStart(maxLength, '0');
    const padCount = padded.length - value.length;
    const [from, to] = selection;
    return { value: padded, selection: [from + padCount, to + padCount] };
  };

  const plugin: MaskitoPlugin = (element) => {
    const input = element as HTMLInputElement;
    const onFocus = () => {
      isFocused = true;
    };
    const onBlur = () => {
      isFocused = false;
      if (input.value && input.value.length < maxLength) {
        input.value = input.value.padStart(maxLength, '0');
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };
    element.addEventListener('focus', onFocus);
    element.addEventListener('blur', onBlur);
    return () => {
      element.removeEventListener('focus', onFocus);
      element.removeEventListener('blur', onBlur);
    };
  };

  return { postprocessor, plugin };
}

/** Truncation postprocessor for non-padded mode */
function truncationPostprocessor(maxLength: number): MaskitoPostprocessor {
  return ({ value, selection }) => {
    if (value.length <= maxLength) {
      return { value, selection };
    }

    const truncated = value.slice(0, maxLength);
    const [from, to] = selection;
    const newSelection: [number, number] = [Math.min(from, maxLength), Math.min(to, maxLength)];

    return { value: truncated, selection: newSelection };
  };
}

/**
 * Configuration for the leading zeros mask
 */
export interface LeadingZerosMaskConfig {
  /** Maximum length of the input field */
  maxLength: number;
  /** Whether to pad the value with leading zeros (true) or keep it without padding (false) */
  padded: boolean;
}

/**
 * Creates a mask for numeric input with optional leading zero padding.
 *
 * @param config Configuration object with maxLength and padded properties
 * @returns MaskitoOptions for the mask
 *
 * @example
 * // Padded mode: '12' displays as '0012'
 * createLeadingZerosMask({ maxLength: 4, padded: true })
 *
 * @example
 * // Non-padded mode: '12' displays as '12'
 * createLeadingZerosMask({ maxLength: 4, padded: false })
 */
export function createLeadingZerosMask(config: LeadingZerosMaskConfig): MaskitoOptions {
  const { maxLength, padded } = config;

  // Validation
  if (!Number.isInteger(maxLength) || maxLength <= 0) {
    throw new Error('maxLength must be a positive integer');
  }

  if (padded) {
    const padding = createPaddingWithBlur(maxLength);
    return {
      mask: Array.from({ length: maxLength }, () => /\d/),
      preprocessors: [digitsOnlyPreprocessor, createBlockWhenFullPreprocessor(maxLength)],
      postprocessors: [padding.postprocessor],
      plugins: [padding.plugin, createClearAllZerosPlugin(maxLength)],
    };
  }

  return {
    mask: Array.from({ length: maxLength }, () => /\d/),
    preprocessors: [digitsOnlyPreprocessor, createBlockWhenFullPreprocessor(maxLength)],
    postprocessors: [truncationPostprocessor(maxLength)],
    plugins: [],
  };
}

/**
 * Configuration for character replacement
 */
export interface CharacterReplacement {
  /** The character or string to find */
  from: string;
  /** The character or string to replace it with */
  to: string;
}

/**
 * Creates a mask that replaces specific characters with others.
 * Useful for transforming input on-the-fly (e.g., replacing < with «).
 *
 * @param replacements Array of character replacements to apply
 * @returns MaskitoOptions for the character replacement mask
 *
 * @example
 * // Replace angle brackets with guillemets
 * createCharacterReplacementMask([
 *   { from: '<', to: '«' },
 *   { from: '>', to: '»' }
 * ])
 *
 * @example
 * // Replace multiple punctuation marks
 * createCharacterReplacementMask([
 *   { from: '...', to: '…' },  // Three dots to ellipsis
 *   { from: '--', to: '—' }     // Double dash to em dash
 * ])
 */
export function createCharacterReplacementMask(
  replacements: CharacterReplacement[]
): MaskitoOptions {
  const replacementPreprocessor: MaskitoPreprocessor = ({ elementState, data }) => {
    let transformedData = data;

    // Apply all replacements
    replacements.forEach(({ from, to }) => {
      // Escape special regex characters in the 'from' string
      const escapedFrom = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedFrom, 'g');
      transformedData = transformedData.replace(regex, to);
    });

    return {
      elementState,
      data: transformedData,
    };
  };

  return {
    mask: /.*/, // Accept any character
    preprocessors: [replacementPreprocessor],
  };
}
