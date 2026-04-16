# Accessibility (WCAG 2.1 AA)
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/accessibility.pt-BR.md)

All form controls are designed to meet **WCAG 2.1 Level AA** compliance. Accessibility is built into the component layer so that consuming pages get correct behavior for free.

## ARIA Attributes on Form Controls

Every form control (`text-form-control`, `currency-form-control`, `date-form-control`, `code-form-control`, `phone-form-control`, `cpf-form-control`, `cnpj-form-control`, `checkbox-form-control`, `select-form-control`, `lookup-form-control`) exposes these ARIA attributes on its interactive element (`<input>` or `<select>`):

| Attribute | Binding | Purpose |
|-----------|---------|---------|
| `aria-invalid` | `[attr.aria-invalid]="isInvalid"` | Announces invalid state to screen readers (WCAG 3.3.1) |
| `aria-required` | `[attr.aria-required]="required"` | Indicates required fields to assistive technology |
| `aria-describedby` | `[attr.aria-describedby]="errorId"` | Links the input to its error message for contextual reading |

The `required` input is available on all controls:

```html
<text-form-control formControlName="name" label="Name" [required]="true">
</text-form-control>
```

## Error Message Linkage

`ErrorMessageComponent` accepts an `[id]` input that is rendered on the `<small>` element. Each form control passes its computed `errorId` (derived from `componentId + '-error'`) so that `aria-describedby` on the input matches the error message `id`:

```html
<!-- Generated DOM (simplified) -->
<input id="name-input" aria-describedby="name-input-error" aria-invalid="true" ...>
<small id="name-input-error" role="alert" aria-live="polite">Name is required</small>
```

The `role="alert"` and `aria-live="polite"` attributes on the error message ensure that screen readers announce errors as they appear without interrupting the user.

## Label Association

All form controls use explicit `<label for="...">` / `<input id="...">` pairing. IDs are auto-generated when `fieldId` is not provided, ensuring uniqueness.

## Decorative Icons

Decorative icons (e.g. calendar in `DateFormControlComponent`) include `aria-hidden="true"` to prevent screen readers from announcing them.

## Range Controls

`RangeCurrencyFormControlComponent` wraps its two currency inputs in a container with `role="group"` and a computed `aria-label` (e.g. "Min Salary to Max Salary"), allowing screen readers to announce the relationship between the two fields.

## Summary of Compliance

| WCAG Criterion | Level | Status |
|----------------|-------|--------|
| 1.1.1 Non-text Content | A | Decorative icons have `aria-hidden`, icon-only buttons have `aria-label` |
| 1.3.1 Info and Relationships | A | All inputs have programmatic label association (`for`/`id`) |
| 3.3.1 Error Identification | A | `aria-invalid` identifies inputs in error; error text is linked via `aria-describedby` |
| 3.3.2 Labels or Instructions | A | All inputs have visible labels |
| 4.1.2 Name, Role, Value | A | All interactive elements expose accessible name and role |
| 1.3.5 Identify Input Purpose | AA | `inputmode="numeric"` on code/CPF fields, `inputmode="tel"` on phone fields |
| 2.4.3 Focus Order | A | Dialog restores focus to trigger element on close |
| 2.4.6 Headings and Labels | AA | Labels are descriptive and unique; dialogs have `aria-labelledby` titles |
| 3.3.3 Error Suggestion | AA | Error messages describe the nature of the error |
| 3.3.4 Error Prevention | AA | Confirmation dialogs before save, delete, and navigation away from dirty forms |
