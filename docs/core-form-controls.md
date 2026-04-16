# Core Form Controls
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/core-form-controls.pt-BR.md)

All form controls implement Angular's `ControlValueAccessor` and integrate with `formControlName` and `[formControl]` bindings.

## Component Hierarchy

```
BaseFormControlComponent              ← shared plumbing (ID, validation state, debug, NgControl)
  ├── TextFormControlComponent        ← general-purpose text input, optional mask
  ├── CurrencyFormControlComponent    ← pt-BR currency formatting
  ├── DateFormControlComponent        ← dd/MM/yyyy date input
  ├── CodeFormControlComponent        ← numeric codes with leading-zero padding
  ├── PhoneFormControlComponent       ← phone mask (DDD-DDDDD-DDDD)
  ├── CpfFormControlComponent         ← CPF mask (XXX.XXX.XXX-XX)
  ├── CnpjFormControlComponent        ← CNPJ mask (AA.AAA.AAA/AAAA-DD)
  ├── CheckboxFormControlComponent    ← boolean state (isChecked), custom true/false values
  ├── SelectFormControlComponent      ← dropdown select with fixed options
  └── LookupFormControlComponent      ← code lookup with ID + display name, dialog search
```

`RangeCurrencyFormControlComponent` and `AddressFormControlComponent` do not extend the hierarchy — they are group wrappers without CVA.

## BaseFormControlComponent

The root abstract directive shared by all form controls that participate in the component hierarchy. Handles ID generation, `NgControl` resolution, validation state, debug mode, and common inputs. Does **not** impose a string-display pipeline, so both text-like and non-text controls (checkbox) can extend it.

**Inputs inherited by all controls:**

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `fieldId` | `string` | auto-generated | Input element ID prefix |
| `label` | `string` | required | Field label |
| `disabled` | `boolean` | `false` | Disable the control |
| `required` | `boolean` | `false` | Mark as required (sets `aria-required`) |
| `groupInvalid` | `boolean` | `false` | Propagate a group-level validation error |
| `customMessages` | `Partial<ErrorMessageConfig>` | — | Per-field error message overrides |

## TextFormControlComponent

General-purpose text input for plain (unmasked) string fields. Accepts an optional Maskito mask and unmask function for ad-hoc formatting, but for well-known formats prefer the dedicated mask components (`PhoneFormControlComponent`, `CpfFormControlComponent`, `CnpjFormControlComponent`).

```html
<text-form-control formControlName="firstName" label="First Name" [maxLength]="10" />
```

| Input | Type | Description |
|-------|------|-------------|
| `mask` | `MaskitoOptions` | Optional Maskito mask |
| `unmask` | `(display: string) => string \| null` | Converts display value to model value |
| `maxLength` | `number` | Maximum character count |

Features: auto-advance when full, select-all on focus.

---

## CodeFormControlComponent

Numeric input for entity codes with leading-zero formatting. Configurable length and padding behavior.

```html
<code-form-control formControlName="id" label="Employee ID"
  [maskConfig]="{ maxLength: 4, padded: true }">
</code-form-control>
```

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `maskConfig` | `LeadingZerosMaskConfig` | `{ maxLength: 4, padded: true }` | Mask configuration |

- **Padded mode** (`padded: true`): Programmatic values pad to `maxLength` immediately (e.g. model `5` renders `0005`). User input stays unpadded while focused and pads on blur. Insertion is blocked when the field is already full. Backspace on an all-zeros field clears it entirely.
- **Non-padded mode** (`padded: false`): No padding; leading zeros are trimmed (e.g. `00005` → `5`); insertion is blocked when the field is full.

Stores the model value as `number | null` via `unmaskLeadingZeros`.

---

## PhoneFormControlComponent

Phone number input with a fixed mask (`DDD-DDDDD-DDDD`, 11 digits). Stores the model value as `string | null` (digits only).

```html
<phone-form-control formControlName="number" label="Phone Number" />
```

Uses `inputmode="tel"` for mobile keyboard optimization. Features: auto-advance when full, select-all on focus.

---

## CpfFormControlComponent

CPF input with a fixed mask (`XXX.XXX.XXX-XX`, 11 digits). Stores the model value as `string | null` (digits only).

```html
<cpf-form-control formControlName="cpf" label="CPF" />
```

Uses `inputmode="numeric"`. Features: auto-advance when full, select-all on focus.

---

## CnpjFormControlComponent

Alphanumeric CNPJ input with a fixed mask (`AA.AAA.AAA/AAAA-DD`). Accepts uppercase letters (A-Z) and digits (0-9) in the first 12 positions, digits only in the last 2 (check digits). Includes a preprocessor that forces input to uppercase.

Stores the model value as `string | null` (alphanumeric characters only, no punctuation).

```html
<cnpj-form-control formControlName="cnpj" label="CNPJ" />
```

Features: auto-advance when full, select-all on focus.

---

## CurrencyFormControlComponent

Currency input formatted in pt-BR style (comma as decimal separator, period as thousands separator). Configurable decimal precision and value bounds.

```html
<currency-form-control formControlName="salary" label="Salary">
</currency-form-control>
```

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `fractionDigits` | `number` | `2` | Number of decimal places |
| `min` | `number` | auto | Minimum value (defaults to `-currencyMaxValue(fractionDigits)`) |
| `max` | `number` | auto | Maximum value (defaults to `currencyMaxValue(fractionDigits)`) |

Stores the model value as `number | null`. The display value `1.250,99` maps to the model value `1250.99`.

When `min` and `max` are not provided, the component automatically derives bounds from `fractionDigits` using `currencyMaxValue()` — the largest value where every decimal step at the given precision still maps to a distinct IEEE 754 float. See [Floating-Point Precision Bounds](./input-masks.md#floating-point-precision-bounds-currencymaxvalue) in the Input Masks section for the full explanation.

Features: auto-advance when decimals are filled, select-all on focus.

---

## DateFormControlComponent

Date input with dd/MM/yyyy mask. Stores the model value as an ISO string (`yyyy-MM-dd`) or `null`.

```html
<date-form-control formControlName="birthDate" label="Birth Date">
</date-form-control>
```

- Display: `25/12/1990` — Model: `1990-12-25`
- Range: 01/01/1900 to 31/12/2500
- Includes a calendar icon in the input group (visual only)

---

## CheckboxFormControlComponent

Checkbox with support for custom true/false values. Extends `BaseFormControlComponent` and implements `ControlValueAccessor` directly (the string-display pipeline used by text-like controls doesn't apply to checkboxes). Integrates with reactive forms via `formControlName` / `[formControl]`.

```html
<checkbox-form-control
  formControlName="active"
  label="Active"
  [options]="{ trueValue: 'S', falseValue: 'N' }">
</checkbox-form-control>
```

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `label` | `string` | required | Field label |
| `options` | `CheckboxOptions` | `{ trueValue: true, falseValue: false }` | Custom values |
| `filterHideFalsy` | `boolean` | `true` | When `true`, excludes the checkbox from the active filters dialog/chips while unchecked. Sets a `data-active-filters-hide` attribute on the host element, which `collectActiveFilters()` checks to skip the control. |

```typescript
interface CheckboxOptions {
  trueValue: any;   // Value when checked
  falseValue: any;  // Value when unchecked
}
```

---

## SelectFormControlComponent

Dropdown select for fields with a fixed set of options. Supports any primitive value type (string, number, boolean). Implements `ControlValueAccessor` — use with `formControlName` or `[formControl]`.

```html
<select-form-control
  formControlName="gender"
  label="Gender"
  placeholder="Choose one…"
  [options]="[
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' }
  ]"
/>
```

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `options` | `SelectOption[]` | `[]` | Array of `{ value: any, label: string }` pairs |
| `placeholder` | `string` | `'Select…'` | Text shown as disabled first option when no value is selected |

The `options` input is re-evaluated whenever it changes, so late-arriving option lists (e.g. loaded asynchronously after the form is patched) correctly resolve the selected item.

```typescript
export interface SelectOption {
  value: any;
  label: string;
}
```

---

## RangeCurrencyFormControlComponent

Two side-by-side currency inputs with cross-field range validation. Designed to be placed inside a `FormGroup` that has a `createRangeValidator()` applied.

```html
<range-currency-form-control
  startControlName="salaryMin"
  endControlName="salaryMax"
  startLabel="Salary From"
  endLabel="Salary To"
  [customMessages]="{ rangeInvalid: (label, p) => p.startLabel + ' cannot exceed ' + p.endLabel }">
</range-currency-form-control>
```

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `startControlName` | `string` | required | FormControl name for the start value |
| `endControlName` | `string` | required | FormControl name for the end value |
| `startLabel` | `string` | `'Start'` | Label for the start input |
| `endLabel` | `string` | `'End'` | Label for the end input |
| `startFieldId` | `string` | — | ID for the start input |
| `endFieldId` | `string` | — | ID for the end input |
| `fractionDigits` | `number` | `2` | Number of decimal places for both currency inputs |
| `min` | `number` | — | Minimum value passed to both currency inputs |
| `max` | `number` | — | Maximum value passed to both currency inputs |

Reads `rangeInvalid` errors from the parent `FormGroup` and propagates `groupInvalid` to both child controls.

---

## AddressFormControlComponent

Composite component that groups street, ZIP code, city, state, and primary checkbox into a reusable address fieldset. Does not implement `ControlValueAccessor` — it delegates to the parent `FormGroup` via `ControlContainer` (`viewProviders`), so the individual controls bind directly to the parent form's `FormControl` names.

```html
<address-form-control
  legend="Home Address"
  streetControlName="street"
  zipControlName="zip"
  cityControlName="city"
  stateControlName="state"
  primaryControlName="isPrimary"
/>
```

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `legend` | `string` | `'Address'` | Fieldset legend text |
| `streetControlName` | `string` | `'street'` | FormControl name for the street field |
| `zipControlName` | `string` | `'zip'` | FormControl name for the ZIP code field |
| `cityControlName` | `string` | `'city'` | FormControl name for the city field |
| `stateControlName` | `string` | `'state'` | FormControl name for the state field |
| `primaryControlName` | `string` | `'isPrimary'` | FormControl name for the primary checkbox |

Uses `code-form-control` with a 5-digit padded leading-zeros mask for ZIP, `text-form-control` for street/city/state, and `checkbox-form-control` for the primary flag.

---

## LookupFormControlComponent

CVA component for selecting a related entity via a dialog or by typing an ID directly. Displays an editable ID field (with leading zeros mask) and a readonly display name, with search and clear buttons. The control value is a `LookupValue` object or `null`.

```typescript
export interface LookupValue {
  id: number | null;
  display: string | null;
}
```

```html
<lookup-form-control
  fieldId="department"
  formControlName="department"
  label="Department"
  [lookupFn]="departmentLookupFn"
  [lookupByIdFn]="departmentLookupByIdFn"
  placeholder="No department selected"
/>
```

The caller provides a `lookupFn` (dialog search) and an optional `lookupByIdFn` (type-to-lookup by ID):

```typescript
readonly departmentLookupFn = () =>
  this.departmentLookupService.open().pipe(
    map(dept => dept ? { id: dept.id, display: dept.name } : null),
  );

readonly departmentLookupByIdFn = (id: number): Observable<string | null> =>
  this.departmentService.getById(id).pipe(map(dept => dept?.name ?? null));
```

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `lookupFn` | `() => Observable<LookupValue \| null>` | required | Function that opens a selection dialog and returns the result |
| `lookupByIdFn` | `(id: number) => Observable<string \| null>` | — | Function that resolves a display name from an ID. Called on ID blur. |
| `placeholder` | `string` | `'No selection'` | Placeholder text for the display name input |
| `idPlaceholder` | `string` | `'ID'` | Placeholder text for the ID input |
| `idMaskConfig` | `LeadingZerosMaskConfig` | `{ maxLength: 4, padded: true }` | Leading zeros mask configuration for the ID input |

**Form integration:** The control stores the full `LookupValue` object, so the parent reads individual fields when building the model:

```typescript
// Form definition
department: this.fb.control<LookupValue | null>(null),

// Reading
departmentId: raw.department?.id ?? null,
departmentName: raw.department?.display ?? null,

// Initializing from an entity
department: employee.departmentId
  ? { id: employee.departmentId, display: employee.departmentName }
  : null,
```

**Type-to-lookup:** The user can type an ID directly in the ID field. On blur, if a `lookupByIdFn` is provided, the component calls it to resolve the display name. If the ID is found, both fields are populated. If not found, the field is cleared. Without `lookupByIdFn`, the ID is accepted as-is with a null display name.

**Interaction:** The search button (magnifying glass icon) opens the lookup dialog. The ID field is editable for direct entry. The display name field is readonly and does not respond to clicks. The clear button removes the current selection.

**Accessibility:** Search and clear buttons have `aria-label` attributes derived from the `label` input. The clear button is disabled when no value is selected.

---

## DynamicRowsComponent

Structural component that renders a reactive `FormArray` as a list of editable rows. The consumer provides a row template via `<ng-template>`; `DynamicRowsComponent` handles add/remove buttons and the empty state.

Each row's `FormGroup` is exposed as the template's implicit context variable, and the row index is exposed via `let-index`. Binding `[formGroup]="group"` on a container inside the template gives `formControlName` directives the correct `ControlContainer` for that row.

```typescript
// employee-edit.component.ts — row factory as a private method using FormBuilder
private buildPhoneRowGroup(phone?: Partial<{ label: string | null; number: string | null }>) {
  return this.fb.group({
    label: this.fb.control<string | null>(phone?.label ?? null, [Validators.required]),
    number: this.fb.control<string | null>(phone?.number ?? null, [Validators.required]),
  });
}

// Arrow function bound for DynamicRowsComponent's [createRow] input
readonly createPhoneRow = () => this.buildPhoneRowGroup();
```

```html
<dynamic-rows
  [formArray]="form.controls.phones"
  [createRow]="createPhoneRow"
  [canAdd]="can('edit') || isNew"
  [canRemove]="can('edit') || isNew"
  addLabel="Add Phone"
  emptyMessage="No phone numbers added yet."
>
  <ng-template let-group let-index="index">
    <div [formGroup]="group" class="row g-2">
      <div class="col-md-4">
        <text-form-control [fieldId]="'phone-label-' + index" formControlName="label" label="Label" />
      </div>
      <div class="col-md-8">
        <phone-form-control [fieldId]="'phone-number-' + index" formControlName="number" label="Number" />
      </div>
    </div>
  </ng-template>
</dynamic-rows>
```

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `formArray` | `FormArray` | required | The FormArray to render |
| `createRow` | `() => AbstractControl` | required | Factory function called on "Add"; typically returns a `FormGroup` |
| `canAdd` | `boolean` | `true` | Shows the add button when true |
| `canRemove` | `boolean` | `true` | Shows the remove button per row when true |
| `addLabel` | `string` | `'Add'` | Label for the add button |
| `emptyMessage` | `string` | `'No items added yet.'` | Text shown when the array has no rows |

**Template context variables:**

| Variable | Binding | Type | Description |
|----------|---------|------|-------------|
| `group` | `let-group` (implicit) | `FormGroup` | The row's FormGroup |
| `index` | `let-index="index"` | `number` | Zero-based row index |

**Model integration:** `FormArray` rows are plain `FormGroup` children — `getRawValue()` on the parent form returns them as a typed array. When the form uses sub-groups for validator scoping, the `formToModel()` method handles the mapping (see Form Pattern above).

**Dirty propagation:** Angular only sets `dirty` when a user interacts with an existing control — `push()` and `removeAt()` are programmatic and do not trigger it. `DynamicRowsComponent` calls `formArray.markAsDirty()` after every add and remove so the parent `FormGroup` becomes dirty. This ensures the `unsavedChangesGuard` fires correctly when the user navigates away after modifying the row list. Note: add-then-remove leaves the form dirty even if the net state equals the original.

**Clear behavior:** Because `FormArray.reset()` only resets values without adding or removing controls, edit pages that use `DynamicRowsComponent` should rebuild the form on clear rather than calling `reset()`:

```typescript
onClear(): void {
  if (this.isNew) {
    this.form = this.buildEmployeeForm();
  } else {
    this.form = this.buildEmployeeForm(this.originalModel);
  }
}
```
