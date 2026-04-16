import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

interface RangeConfig {
  startKey?: string;
  endKey?: string;
  startLabel?: string;
  endLabel?: string;
}

/**
 * Creates a cross-field range validator for use on a FormGroup or FormGroup-like control.
 * Returns a rangeInvalid error when the start value exceeds the end value.
 * @param config - Control key names and human-readable labels for message resolution
 */
export function createRangeValidator(config: RangeConfig = {}): ValidatorFn {
  const { startKey = 'start', endKey = 'end', startLabel, endLabel } = config;

  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get(startKey)?.value as number | null;
    const end = group.get(endKey)?.value as number | null;
    return start != null && end != null && start > end
      ? {
          rangeInvalid: startLabel && endLabel ? { label: startLabel, otherLabel: endLabel } : true,
        }
      : null;
  };
}
