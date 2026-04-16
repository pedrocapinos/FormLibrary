# Error Messaging
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/error-messaging.pt-BR.md)

## ErrorMessageService

Singleton service that resolves validation error messages. Decouples error text from individual form controls.

```typescript
import { ErrorMessageService } from 'src/app/core/services/error-message.service';
```

**API:**

```typescript
// Global configuration — call once, typically in APP_INITIALIZER
service.configure(overrides: Partial<ErrorMessageConfig>): void

// Resolve a message for a control's current errors
service.resolve(errors: ValidationErrors, label: string, customMessages?: Partial<ErrorMessageConfig>): string
```

**MessageFactory type:**
```typescript
type MessageFactory = (label: string, params?: any) => string;
```

**ErrorMessageConfig interface:**
```typescript
interface ErrorMessageConfig {
  required: MessageFactory;
  minlength: MessageFactory;   // params.requiredLength
  maxlength: MessageFactory;   // params.requiredLength
  min: MessageFactory;         // params.min
  max: MessageFactory;         // params.max
  pattern: MessageFactory;
  rangeInvalid: MessageFactory; // params.label, params.otherLabel
  atLeastOneRequired: MessageFactory;
  [key: string]: MessageFactory; // Extensible for custom error keys
}
```

**Priority order:** custom messages → global configured messages → built-in defaults → `'Invalid field'`

**Global configuration via APP_INITIALIZER** (active in `app.config.ts`):
```typescript
// app.config.ts — overrides defaults for the entire application
{
  provide: APP_INITIALIZER,
  useFactory: (svc: ErrorMessageService) => () => {
    svc.configure({
      required: (label) => `${label} cannot be empty`,
      min: (label, p) => `${label} must be greater than or equal to ${p?.min}`,
      max: (label, p) => `${label} must be less than or equal to ${p?.max}`,
    });
  },
  deps: [ErrorMessageService],
  multi: true,
}
```

After this configuration, all required fields show "X cannot be empty" instead of "X is required".

**Per-field override (via component input)** — used in the Employee edit page:
```html
<!-- employee-edit.component.html — overrides only the ID field -->
<code-form-control
  formControlName="id"
  label="ID"
  [customMessages]="idMessages"
/>
```
```typescript
// employee-edit.component.ts
readonly idMessages: Partial<ErrorMessageConfig> = {
  min: (_, p) => `Employee ID must be at least ${p?.min}`,
  max: (_, p) => `Employee ID must not exceed ${p?.max}`,
};
```

**Pending state:** When an async validator is running, `ErrorMessageComponent` shows a "Validating..." spinner instead of an error message. This is handled automatically for any control with async validators.

**ErrorMessageComponent inputs:**

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `control` | `AbstractControl \| AbstractControlDirective \| null` | `null` | The form control or directive to observe for errors |
| `label` | `string` | `'Field'` | Label used in error message text (e.g. "Name is required") |
| `customMessages` | `Partial<ErrorMessageConfig>` | — | Per-field error message overrides |
| `id` | `string \| undefined` | — | Sets the `id` on the `<small>` element for `aria-describedby` linkage |
