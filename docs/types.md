# Types
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/types.pt-BR.md)

## ColumnDefinition\<T\>

Describes a single column in `GenericTableComponent`.

```typescript
interface ColumnDefinition<T = any> extends Formattable {
  key: keyof T & string;                      // Property name on the data object
  header: string;                             // Column header label
  width?: string;                             // Optional CSS width (e.g. '120px', '10%')
  formatter?: (value: any, row: T) => string; // Optional display formatter (overrides format)
  calculateTotal?: boolean;                   // Sum this column and display in the totals footer row
  sticky?: boolean;                           // Pin column to the left edge during horizontal scroll
  visible?: boolean;                          // Show/hide column (used with column visibility toggle)
}
```

Both `ColumnDefinition` and `ActiveFilterConfig` extend the shared `Formattable` interface:

```typescript
interface Formattable {
  format?: FormatType;         // Shorthand: 'cpf' | 'cnpj' | 'currency' | 'date' | 'boolean' | 'phone' | 'text'
  formatOptions?: FormatOptions; // Options passed to FormatService (e.g. currencyCode, trueLabel)
  formatter?: (value: any, ...args: any[]) => string; // Custom formatter (overrides format)
}
```

**Example:**
```typescript
const columns: ColumnDefinition<Employee>[] = [
  { key: 'id', header: 'ID', width: '80px' },
  { key: 'firstName', header: 'Name' },
  { key: 'cpf', header: 'CPF', format: 'cpf' },
  { key: 'salary', header: 'Salary', format: 'currency', calculateTotal: true },
  { key: 'isActive', header: 'Active', format: 'boolean', visible: false },
];
```

## ActiveFilterConfig

Declares how a single form control should appear in the active filters bar and dialog. Defined per-entity in `entity.filter.ts` (list pages) or `entity.model.ts` (edit pages).

```typescript
interface ActiveFilterConfig extends Formattable {
  label: string;       // Human-readable label shown in the chip/dialog
  hidden?: boolean;    // Exclude this control from active filters
  tabId?: string;      // Tab identifier — used to group filters into cards and switch tabs
  tabLabel?: string;   // Human-readable tab name shown in the card header
}
```

For pages with tabs, use `defineTabFilterConfig()` to declare the config in a structured, tab-first format. The helper injects `tabId` and `tabLabel` into each field automatically:

```typescript
import { defineTabFilterConfig } from '../core/types/active-filter-config';

const MY_FILTER_CONFIG = defineTabFilterConfig([
  {
    tabId: 'personal',
    tabLabel: 'Personal Info',
    fields: {
      firstName: { label: 'First Name' },
      cpf:       { label: 'CPF', format: 'cpf' },
    },
  },
  {
    tabId: 'contact',
    tabLabel: 'Contact',
    fields: {
      phone: { label: 'Phone' },
      email: { label: 'Email' },
    },
  },
]);
```

For pages without tabs, the plain `Record<string, ActiveFilterConfig>` syntax still works:

```typescript
const EMPLOYEE_LIST_FILTER_CONFIG: Record<string, ActiveFilterConfig> = {
  id: { label: 'ID' },
  firstName: { label: 'First Name' },
  isActive: { label: 'Active only', format: 'boolean' },
  salaryMin: { label: 'Min Salary', format: 'currency' },
  salaryMax: { label: 'Max Salary', format: 'currency' },
};
```

## ActiveFilter

Describes a single active filter entry displayed in the `GenericTableComponent` filters bar and the `ActiveFiltersContentComponent`.

```typescript
interface ActiveFilter {
  controlName: string;   // FormControl key — used to focus the input on click
  label: string;         // Human-readable label (resolved from ActiveFilterConfig)
  displayValue: string;  // Formatted display value (resolved via FormatService or custom formatter)
  tabId?: string;        // Propagated from ActiveFilterConfig — used for dialog grouping and tab switching
  tabLabel?: string;     // Propagated from ActiveFilterConfig — shown as the card header in the dialog
}
```

Collected automatically via `collectActiveFilters(form, config, formatService)` from `src/app/core/utils/collect-active-filters.ts`. The function traverses the `FormGroup`, matches each control path against the config object (supporting wildcard paths like `phones.*.number`), and formats non-empty values using `FormatService` or a custom `formatter`.
