# Validators
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/validators.pt-BR.md)

## atLeastOneRequiredValidator

A factory function that returns a `ValidatorFn` for a `FormGroup`. Requires at least one of the specified controls to have a non-empty value. Treats `0` as a valid (filled) value.

```typescript
import { createAtLeastOneRequiredValidator } from 'src/app/core/validators/at-least-one-required-validator';

// Used on the employee edit form's address sub-group
address: this.fb.group({
  street: this.fb.control<string | null>(null),
  city: this.fb.control<string | null>(null),
  state: this.fb.control<string | null>(null),
  zip: this.fb.control<string | null>(null),
}, { validators: [createAtLeastOneRequiredValidator(['street', 'city', 'state', 'zip'])] });
```

Returns `{ atLeastOneRequired: true }` when all specified controls are empty. Emptiness is determined by the shared `isEmpty()` helper at `src/app/core/utils/is-empty.ts`, which treats `null`, `undefined`, `NaN`, blank strings, empty arrays, and objects whose values are all empty as empty. The `ErrorMessageService` default message is: `"At least one {label} field is required"`.

The `AddressFormControlComponent` propagates the invalid state internally — it reads the group error and applies `[groupInvalid]` to its child controls automatically.

**Used in:** Employee edit page — address fieldset requires at least one address field (street, city, state, or ZIP).

---

## createRangeValidator(config)

Factory function that returns a `ValidatorFn` for a `FormGroup`. Validates that the start value does not exceed the end value.

```typescript
createEmployeeFilterForm() {
  return new FormGroup({
    salaryMin: new FormControl<number | null>(null),
    salaryMax: new FormControl<number | null>(null),
  }, {
    validators: createRangeValidator({
      startKey: 'salaryMin',
      endKey: 'salaryMax',
      startLabel: 'Salary From',
      endLabel: 'Salary To',
    })
  });
}
```

```typescript
interface RangeConfig {
  startKey?: string;    // FormControl key for start value (default: 'start')
  endKey?: string;      // FormControl key for end value (default: 'end')
  startLabel?: string;  // Label for start field (used in error params)
  endLabel?: string;    // Label for end field (used in error params)
}
```

Returns `{ rangeInvalid: { label: startLabel, otherLabel: endLabel } }` when start > end. Returns `null` when either value is `null` (validation is skipped if either field is empty).
