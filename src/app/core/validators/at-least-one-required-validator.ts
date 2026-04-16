import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';
import { isEmpty } from '../utils/is-empty';

/**
 * Factory that returns a group-level validator requiring at least one specified control
 * (or all controls, if no keys are provided) to have a non-empty value.
 * Emptiness is determined by `isEmpty` (recurses into nested groups/arrays).
 *
 * @param keys - Optional list of control names to check. If omitted, all controls are checked.
 *
 * Apply to a FormGroup via: new FormGroup({ ... }, { validators: [createAtLeastOneRequiredValidator(['name', 'code'])] })
 */
export function createAtLeastOneRequiredValidator(keys?: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormGroup)) return null;

    const controls = keys
      ? keys.map((k) => control.get(k)).filter((c): c is AbstractControl => c != null)
      : Object.values(control.controls);

    const hasValue = controls.some((c) => !isEmpty(c.value));

    return hasValue ? null : { atLeastOneRequired: true };
  };
}

// Backward-compatible alias — validates all controls
export const atLeastOneRequiredValidator: ValidatorFn = createAtLeastOneRequiredValidator();
