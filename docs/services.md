# Services
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/services.pt-BR.md)

## SearchStateService

In-memory key-value store for persisting filter form values across navigation. State is lost on page refresh.

```typescript
import { SearchStateService } from 'src/app/core/services/search-state.service';
```

```typescript
// Save filter state before navigating away
service.save<EmployeeFilter>('employee-filters', filterForm.value);

// Restore on component init
const saved = service.restore<EmployeeFilter>('employee-filters');
if (saved) filterForm.patchValue(saved);

// Clear on explicit reset
service.clear('employee-filters');
```

| Method | Description |
|--------|-------------|
| `save<T>(key, value)` | Store any value under a string key |
| `restore<T>(key)` | Retrieve stored value, or `null` if not found |
| `clear(key)` | Remove a stored value |
| `clearAll()` | Remove all stored values (called by `AuthService.logout()`) |

---

## FormatService

Singleton service that formats raw values into display strings. Used by `GenericTableComponent` (column formatting), `ActiveFiltersDialogService` (filter value display), and `collectActiveFilters()`.

```typescript
import { FormatService } from 'src/app/core/services/format.service';
```

**API:**

```typescript
service.format(value: any, type?: FormatType, options?: FormatOptions): string
```

| FormatType | Input Example | Output Example | Notes |
|------------|--------------|----------------|-------|
| `'cpf'` | `'12345678909'` | `'123.456.789-09'` | Applies CPF mask |
| `'cnpj'` | `'A1B2C3D40001G7'` | `'A1.B2C.3D4/0001-G7'` | Applies alphanumeric CNPJ mask |
| `'phone'` | `'01198765432'` | `'011-98765-4321'` | Applies phone mask |
| `'date'` | `'1990-12-25'` | `'25/12/1990'` | ISO to dd/MM/yyyy |
| `'currency'` | `1250.99` | `'R$ 1.250,99'` | Uses Angular `CurrencyPipe` |
| `'boolean'` | `true` | `'Yes'` | Configurable labels |
| `'text'` / `undefined` | `42` | `'42'` | `String(value)` fallback |

Returns `options.defaultFallback` (default `'—'`) for null, undefined, or empty values.

**FormatOptions:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `currencyCode` | `string` | `'BRL'` | Currency code for `'currency'` type |
| `display` | `string \| boolean` | `'symbol-narrow'` | CurrencyPipe display mode |
| `digitsInfo` | `string` | — | CurrencyPipe digits info |
| `trueLabel` | `string` | `'Yes'` | Display label for `true` values |
| `falseLabel` | `string` | `'No'` | Display label for `false` values |
| `defaultFallback` | `string` | `'—'` | Returned for empty values |

**Integration with table and filter configs:** Both `ColumnDefinition` and `ActiveFilterConfig` support `format?: FormatType` and `formatOptions?: FormatOptions`, enabling declarative formatting without custom `formatter` functions.

---

## DebugService

Singleton service that provides a global debug toggle for all form controls. When enabled, every form control displays its raw value and internal state (dirty, touched, errors). The state persists across navigation but resets on page reload.

A toggle button is available in the sidebar (above the Logout button). The button uses `btn-warning` when active and `btn-outline-warning` when inactive.

```typescript
import { DebugService } from 'src/app/core/services/debug.service';
```

**API:**

| Member | Type | Description |
|--------|------|-------------|
| `enabled` | `boolean` | Whether debug mode is active (default `false`) |
| `toggle()` | `void` | Flips the debug state on/off |

All form controls (via `BaseFormControlComponent`) and `RangeCurrencyFormControlComponent` read from this service automatically — no per-control `[debugMode]` binding is needed.

---

## ToastService

Singleton notification service that shows non-blocking toasts with auto-dismiss and stacking. Provides visual feedback for save, delete, export, and batch operations.

```typescript
import { ToastService } from 'src/app/core/services/toast.service';
```

**Shorthand methods:**

```typescript
toastService.success('Employee saved successfully'); // green, 4s auto-dismiss
toastService.error('Failed to save');               // red, sticky (manual dismiss)
toastService.warning('Unsaved changes');             // yellow, 6s auto-dismiss
toastService.info('Exported to CSV');                // blue, 4s auto-dismiss
```

**Full control:**

```typescript
toastService.show({
  message: 'Custom toast',
  type: 'success',
  duration: 8000,       // ms; 0 = manual dismiss only
  dismissible: true,    // show close button (default: true)
});
```

| Method | Description |
|--------|-------------|
| `success(message)` | Show a success toast (4s) |
| `error(message)` | Show an error toast (sticky) |
| `warning(message)` | Show a warning toast (6s) |
| `info(message)` | Show an info toast (4s) |
| `show(config)` | Show a toast with full `ToastConfig` control |
| `dismiss(id)` | Manually dismiss a toast |

**ToastContainerComponent** is placed once in `AppComponent` (same pattern as `<dialog-host>`). Toasts stack vertically at the bottom-right corner. Each toast uses `role="alert"` with `aria-live="polite"` (success/info) or `aria-live="assertive"` (error/warning) for WCAG 2.1 AA compliance.

**Built-in integration:**
- Edit pages show success toasts after save and delete
- List pages show a count toast after batch deletion (via `BatchOperationsService.deleteSelected`)
- `GenericTableComponent` shows info toasts on CSV/XLSX/PDF export and clipboard copy

## Batch Delete Pattern

List pages consolidate batch deletion through `BatchOperationsService.deleteSelected()` — see the [BatchOperationsService](./display-components.md#batchoperationsservice) section for the full API and usage example. The service handles empty-item checks, details truncation (max 10), confirmation dialog, and null-id filtering; the caller supplies `items`, `formatDetail`, and a `deleteFn`, and controls post-delete behavior (toast, clearing selection, re-searching) in the result subscription.
