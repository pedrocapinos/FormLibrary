# Directives
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/directives.pt-BR.md)

## AutoAdvanceDirective — `[autoAdvance]`

Automatically focuses the next form element when the current input is full.

```html
<input [autoAdvance]="isFull" />
```

| Input | Type | Description |
|-------|------|-------------|
| `autoAdvance` | `(el: HTMLInputElement) => boolean` | Returns `true` when the field is considered full |

Moves focus to the next focusable element only when the cursor is at the end of the field, preventing disruption during mid-field editing.

---

## SelectAllOnFocusDirective — `[selectAllOnFocus]`

Selects all text in an input when it receives focus.

```html
<input selectAllOnFocus />
```

---

## UnmaskDirective — `[maskito][unmaskHandler]`

Intercepts the `ControlValueAccessor` to apply masking and unmasking transparently. The form control model holds the unmasked value; the input displays the masked value.

```html
<input [maskito]="cpfMask" [unmaskHandler]="unmaskCpf" />
```

| Input | Type | Description |
|-------|------|-------------|
| `unmaskHandler` | `(value: string) => any` | Converts display value to model value |
| `maskHandler` | `(value: any) => string` | Converts model value to display value (default: `maskitoTransform`) |

---

## FocusOnErrorDirective — `form[formGroup][appFocusOnError]`

On form submit, marks all controls as touched (triggering validation display) and scrolls to and focuses the first invalid field.

```html
<form [formGroup]="form" appFocusOnError (ngSubmit)="onSubmit()">
```

Eliminates the need for manual `markAllAsTouched()` calls and gives users clear feedback on which field failed.

**Tab support:** if the invalid field is inside a hidden tab panel, the directive automatically switches to that tab before focusing. Requires the standard tab markup convention — see the [Tab switching convention](./display-components.md#tab-switching-convention) in the Active Filters Dialog section.

**Group-level validators:** when the only failing validator lives on the `FormGroup` (e.g. the range validator on the enclosing form) no child control is `ng-invalid`. The directive falls back to the first element marked with `data-group-validator` on its host component (`RangeCurrencyFormControlComponent`, `AddressFormControlComponent`, etc.) and focuses the first input inside it.
