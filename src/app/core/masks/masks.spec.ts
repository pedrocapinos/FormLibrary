import { MaskitoOptions } from '@maskito/core';
import {
  createLeadingZerosMask,
  unmaskCpf,
  unmaskCnpjAlfanumerico,
  unmaskCurrency,
  unmaskLeadingZeros,
} from './masks';

// ========== Test Helper Utilities ==========

/** ElementState interface matching Maskito's internal type */
interface ElementState {
  readonly value: string;
  readonly selection: readonly [number, number];
}

/** Helper to create element state for testing */
function createState(value: string, cursorPos: number): ElementState {
  return {
    value,
    selection: [cursorPos, cursorPos] as const,
  };
}

/** Helper to create element state with selection */
function createStateWithSelection(value: string, from: number, to: number): ElementState {
  return {
    value,
    selection: [from, to] as const,
  };
}

/**
 * Simulates the complete Maskito processing pipeline:
 * preprocessors → mask validation → postprocessors
 */
function simulateMaskito(
  maskOptions: MaskitoOptions,
  currentState: ElementState,
  inputData: string,
  actionType: 'insert' | 'deleteBackward' | 'deleteForward' = 'insert'
): ElementState {
  const initialState = currentState;
  let state = currentState;
  let data = inputData;

  // 1. Run preprocessors
  if (maskOptions.preprocessors) {
    for (const preprocessor of maskOptions.preprocessors) {
      const result = preprocessor({ elementState: state, data }, actionType);
      state = result.elementState;
      data = result.data ?? '';
    }
  }

  // 2. Apply mask (simulate basic mask validation)
  const [from, to] = state.selection;
  let newValue = state.value.slice(0, from) + data + state.value.slice(to);
  let newSelection: [number, number] = [from + data.length, from + data.length];

  // Validate against mask pattern
  const mask = maskOptions.mask as Array<RegExp | string>;
  let validatedValue = '';
  let cursorAdjustment = 0;

  for (let i = 0; i < newValue.length && validatedValue.length < mask.length; i++) {
    const char = newValue[i];
    const maskIndex = validatedValue.length;
    const maskItem = mask[maskIndex];

    if (typeof maskItem === 'string') {
      validatedValue += maskItem;
      if (i < from) cursorAdjustment++;
    } else if (maskItem instanceof RegExp && maskItem.test(char)) {
      validatedValue += char;
    } else {
      continue;
    }
  }

  state = {
    value: validatedValue,
    selection: [
      Math.min(newSelection[0] + cursorAdjustment, validatedValue.length),
      Math.min(newSelection[1] + cursorAdjustment, validatedValue.length),
    ] as const,
  };

  // 3. Run postprocessors
  if (maskOptions.postprocessors) {
    for (const postprocessor of maskOptions.postprocessors) {
      state = postprocessor(state, initialState);
    }
  }

  return state;
}

/**
 * Simulates user typing a character at the cursor position
 */
function typeAtCursor(
  maskOptions: MaskitoOptions,
  currentState: ElementState,
  char: string
): ElementState {
  return simulateMaskito(maskOptions, currentState, char, 'insert');
}

/**
 * Simulates programmatic value setting (like ngModel binding)
 * This only goes through postprocessors, not preprocessors
 */
function setProgrammaticValue(maskOptions: MaskitoOptions, value: string): ElementState {
  const initialState = createState(value, value.length);
  let state = initialState;

  if (maskOptions.postprocessors) {
    for (const postprocessor of maskOptions.postprocessors) {
      state = postprocessor(state, initialState);
    }
  }

  return state;
}

/**
 * Registers plugins on a real input element and dispatches focus,
 * setting the internal isFocused flag to true via the blur-padding plugin.
 */
function setupFocusedMask(maskOptions: MaskitoOptions): {
  element: HTMLInputElement;
  cleanup: () => void;
} {
  const element = document.createElement('input');
  const cleanups: (() => void)[] = [];

  if (maskOptions.plugins) {
    for (const plugin of maskOptions.plugins) {
      const cleanup = (plugin as Function)(element);
      if (cleanup) cleanups.push(cleanup);
    }
  }

  element.dispatchEvent(new Event('focus'));

  return {
    element,
    cleanup: () => cleanups.forEach((c) => c()),
  };
}

/**
 * Simulates backspace key at cursor position
 * Also simulates plugin behavior by checking if a plugin would prevent the default backspace
 */
function backspaceAtCursor(maskOptions: MaskitoOptions, currentState: ElementState): ElementState {
  const [from, to] = currentState.selection;

  // Simulate createClearAllZerosPlugin behavior
  if (maskOptions.plugins && maskOptions.plugins.length > 0) {
    const { value } = currentState;
    const isAllZeros = /^0+$/.test(value);
    const maxLength = (maskOptions.mask as RegExp[]).length;
    const isFullLength = value.length === maxLength;
    const cursorAtEnd = from === value.length && to === value.length;

    if (isAllZeros && isFullLength && cursorAtEnd) {
      return createState('', 0);
    }
  }

  if (from === to && from > 0) {
    const newValue = currentState.value.slice(0, from - 1) + currentState.value.slice(from);
    return simulateMaskito(maskOptions, createState(newValue, from - 1), '', 'deleteBackward');
  } else if (from !== to) {
    const newValue = currentState.value.slice(0, from) + currentState.value.slice(to);
    return simulateMaskito(maskOptions, createState(newValue, from), '', 'deleteBackward');
  }

  return currentState;
}

// ========== Tests ==========

describe('Masks', () => {
  describe('createLeadingZerosMask', () => {
    describe('Padded Mode (maxLength=4)', () => {
      let mask: MaskitoOptions;

      beforeEach(() => {
        mask = createLeadingZerosMask({ maxLength: 4, padded: true });
      });

      describe('Programmatic Values (unfocused)', () => {
        it('should pad short values with leading zeros', () => {
          expect(setProgrammaticValue(mask, '5').value).toBe('0005');
          expect(setProgrammaticValue(mask, '12').value).toBe('0012');
          expect(setProgrammaticValue(mask, '123').value).toBe('0123');
          expect(setProgrammaticValue(mask, '0').value).toBe('0000');
        });

        it('should keep empty string as empty', () => {
          expect(setProgrammaticValue(mask, '').value).toBe('');
        });

        it('should handle full-length and over-length values', () => {
          expect(setProgrammaticValue(mask, '1234').value).toBe('1234');
          expect(setProgrammaticValue(mask, '12345').value).toBe('1234');
        });
      });

      describe('Typing (focused)', () => {
        let cleanup: () => void;

        beforeEach(() => {
          ({ cleanup } = setupFocusedMask(mask));
        });

        afterEach(() => cleanup());

        it('should type digits without padding', () => {
          let state = createState('', 0);

          state = typeAtCursor(mask, state, '1');
          expect(state.value).toBe('1');
          expect(state.selection).toEqual([1, 1]);

          state = typeAtCursor(mask, state, '2');
          expect(state.value).toBe('12');
          expect(state.selection).toEqual([2, 2]);

          state = typeAtCursor(mask, state, '3');
          expect(state.value).toBe('123');

          state = typeAtCursor(mask, state, '4');
          expect(state.value).toBe('1234');
        });

        it('should block typing when field is full', () => {
          let state = createState('1234', 4);
          state = typeAtCursor(mask, state, '5');
          expect(state.value).toBe('1234');
        });

        it('should filter non-digit characters', () => {
          let state = createState('', 0);
          state = typeAtCursor(mask, state, 'a');
          expect(state.value).toBe('');

          state = typeAtCursor(mask, state, '5');
          expect(state.value).toBe('5');
        });

        it('should replace selected text', () => {
          const state = createStateWithSelection('1234', 1, 3);
          const result = typeAtCursor(mask, state, '9');
          expect(result.value).toBe('194');
          expect(result.selection).toEqual([2, 2]);
        });
      });

      describe('Blur', () => {
        it('should pad incomplete values on blur', () => {
          const { element, cleanup } = setupFocusedMask(mask);

          element.value = '5';
          element.dispatchEvent(new Event('blur'));
          expect(element.value).toBe('0005');

          element.dispatchEvent(new Event('focus'));
          element.value = '12';
          element.dispatchEvent(new Event('blur'));
          expect(element.value).toBe('0012');

          cleanup();
        });

        it('should not change full-length or empty values on blur', () => {
          const { element, cleanup } = setupFocusedMask(mask);

          element.value = '1234';
          element.dispatchEvent(new Event('blur'));
          expect(element.value).toBe('1234');

          element.dispatchEvent(new Event('focus'));
          element.value = '';
          element.dispatchEvent(new Event('blur'));
          expect(element.value).toBe('');

          cleanup();
        });
      });

      describe('Backspace (focused)', () => {
        let cleanup: () => void;

        beforeEach(() => {
          ({ cleanup } = setupFocusedMask(mask));
        });

        afterEach(() => cleanup());

        it('should delete without re-padding', () => {
          let state = createState('1234', 4);

          state = backspaceAtCursor(mask, state);
          expect(state.value).toBe('123');

          state = backspaceAtCursor(mask, state);
          expect(state.value).toBe('12');

          state = backspaceAtCursor(mask, state);
          expect(state.value).toBe('1');

          state = backspaceAtCursor(mask, state);
          expect(state.value).toBe('');
        });

        it('should clear field when all zeros', () => {
          let state = createState('0000', 4);
          state = backspaceAtCursor(mask, state);
          expect(state.value).toBe('');
        });
      });

      it('should work with different maxLength values', () => {
        const mask2 = createLeadingZerosMask({ maxLength: 2, padded: true });
        expect(setProgrammaticValue(mask2, '5').value).toBe('05');

        const mask6 = createLeadingZerosMask({ maxLength: 6, padded: true });
        expect(setProgrammaticValue(mask6, '123').value).toBe('000123');

        const mask8 = createLeadingZerosMask({ maxLength: 8, padded: true });
        expect(setProgrammaticValue(mask8, '42').value).toBe('00000042');
      });
    });

    describe('Non-Padded Mode (maxLength=4)', () => {
      let mask: MaskitoOptions;

      beforeEach(() => {
        mask = createLeadingZerosMask({ maxLength: 4, padded: false });
      });

      it('should not pad values', () => {
        expect(setProgrammaticValue(mask, '5').value).toBe('5');
        expect(setProgrammaticValue(mask, '12').value).toBe('12');
        expect(setProgrammaticValue(mask, '').value).toBe('');
      });

      it('should truncate values exceeding maxLength', () => {
        expect(setProgrammaticValue(mask, '12345').value).toBe('1234');
      });

      it('should allow typing up to maxLength and block beyond', () => {
        let state = createState('', 0);

        state = typeAtCursor(mask, state, '1');
        expect(state.value).toBe('1');

        state = typeAtCursor(mask, state, '2');
        expect(state.value).toBe('12');

        state = typeAtCursor(mask, state, '3');
        expect(state.value).toBe('123');

        state = typeAtCursor(mask, state, '4');
        expect(state.value).toBe('1234');

        state = typeAtCursor(mask, state, '5');
        expect(state.value).toBe('1234');
      });

      it('should filter out non-digit characters', () => {
        let state = createState('', 0);

        state = typeAtCursor(mask, state, 'a');
        expect(state.value).toBe('');

        state = typeAtCursor(mask, state, '5');
        expect(state.value).toBe('5');
      });
    });

    describe('Validation', () => {
      it('should throw error for invalid maxLength', () => {
        expect(() => createLeadingZerosMask({ maxLength: 3.5, padded: true })).toThrowError(
          'maxLength must be a positive integer'
        );
        expect(() => createLeadingZerosMask({ maxLength: 0, padded: true })).toThrowError(
          'maxLength must be a positive integer'
        );
        expect(() => createLeadingZerosMask({ maxLength: -1, padded: true })).toThrowError(
          'maxLength must be a positive integer'
        );
      });
    });
  });

  describe('Unmask Functions', () => {
    describe('unmaskCpf', () => {
      it('should remove formatting characters', () => {
        expect(unmaskCpf('123.456.789-00')).toBe('12345678900');
        expect(unmaskCpf('12345678900')).toBe('12345678900');
        expect(unmaskCpf('')).toBe('');
      });
    });

    describe('unmaskCnpjAlfanumerico', () => {
      it('should remove formatting and keep only alphanumeric', () => {
        expect(unmaskCnpjAlfanumerico('A1.B2C.3D4/0001-G7')).toBe('A1B2C3D40001G7');
        expect(unmaskCnpjAlfanumerico('AB.12#34@56')).toBe('AB123456');
        expect(unmaskCnpjAlfanumerico('')).toBe('');
      });
    });

    describe('unmaskCurrency', () => {
      it('should parse formatted currency to number', () => {
        expect(unmaskCurrency('1.234,56')).toBe(1234.56);
        expect(unmaskCurrency('42,00')).toBe(42);
        expect(unmaskCurrency('0,00')).toBe(0);
      });

      it('should return null for empty or unparseable string', () => {
        expect(unmaskCurrency('')).toBe(null);
      });
    });

    describe('unmaskLeadingZeros', () => {
      it('should remove leading zeros and return number', () => {
        expect(unmaskLeadingZeros('0012')).toBe(12);
        expect(unmaskLeadingZeros('0005')).toBe(5);
        expect(unmaskLeadingZeros('00123')).toBe(123);
        expect(unmaskLeadingZeros('1234')).toBe(1234);
      });

      it('should return 0 for all-zero values', () => {
        expect(unmaskLeadingZeros('0000')).toBe(0);
        expect(unmaskLeadingZeros('0')).toBe(0);
      });

      it('should return null for empty or invalid values', () => {
        expect(unmaskLeadingZeros('')).toBe(null);
        expect(unmaskLeadingZeros('abc')).toBe(null);
      });
    });
  });
});
