# Display Components
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/display-components.pt-BR.md)

## GenericTableComponent

CDK-based data table with sorting, pagination, row selection, column reordering, and export.

```html
<generic-table
  [columns]="columns"
  [data]="employees"
  [pageSize]="10"
  [selectable]="true"
  [reorderableColumns]="true"
  (rowClick)="onRowClick($event)"
  (selectionChange)="onSelectionChange($event)">
</generic-table>
```

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `columns` | `ColumnDefinition<T>[]` | `[]` | Column definitions |
| `data` | `T[]` | `[]` | Row data |
| `pageSize` | `number \| undefined` | `undefined` | Rows per page; `undefined` disables pagination |
| `showActions` | `boolean` | `true` | Show export/copy toolbar |
| `exportFilename` | `string` | `'export'` | Base filename for exports |
| `selectable` | `boolean` | `false` | Enable checkbox row selection |
| `selectionKey` | `keyof T \| ((row: T) => unknown)` | `'id'` | Property name or function that returns a stable identity for each row. Used to preserve selection across `data` re-fetches (re-fetch returns fresh object refs; selection matches by key, not reference). |
| `reorderableColumns` | `boolean` | `false` | Enable drag-to-reorder columns |
| `filterForm` | `FormGroup` | — | Filter form whose active values are shown in the footer filters bar |
| `filterConfig` | `Record<string, ActiveFilterConfig>` | — | Configuration object for active filters |
| `showColumnPicker` | `boolean` | `false` | Show a column visibility toggle dropdown in the toolbar |

| Output | Description |
|--------|-------------|
| `rowClick` | Emits the clicked row |
| `selectionChange` | Emits the current selection array |

**Features:**
- Click column headers to sort (toggles asc/desc)
- Page navigation with go-to-page controls
- Select individual rows or all rows; filter to show selected only
- Drag columns to reorder
- Export to **CSV**, **XLSX**, **PDF**
- Copy table to clipboard
- Print table
- Pin columns to the left edge with `sticky: true` in the column definition. Sticky columns must use an explicit `Npx` `width` (e.g. `'120px'`) — `%`, `rem`, and `auto` cannot be used to compute left offsets and will log a warning.
- Toggle column visibility via the column picker dropdown

**Footer rows:**
- **Totals row** — rendered as a `<tfoot>` row when any column has `calculateTotal: true`; sums all values in `sortedBase` (all pages, not just the visible page) and formats the result using the column's own `formatter`. Only visible when data is present.
- **Active filters bar** — a styled band below the table showing which filters were applied, as `Label: value` chips. Collected automatically from `filterForm` whenever `data` changes. Only visible when there are active filters.

**Toolbar layout:**
- The export/copy buttons are always pinned to the right of the toolbar.
- When rows are selected, a "X selected" indicator and a "Show selected only" toggle appear on the left, pushing the export buttons but not shifting the table.

---

## GenericHeaderComponent

Consistent page header with title, optional subtitle, optional back button, and a content slot for action buttons.

```html
<generic-header title="Employees" [showBackButton]="true" (backClick)="onBack()">
  <button class="btn btn-primary" (click)="onNew()">New Employee</button>
</generic-header>
```

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `title` | `string` | required | Page title |
| `subtitle` | `string` | — | Optional subtitle |
| `showBackButton` | `boolean` | `false` | Show a back arrow button |

| Output | Description |
|--------|-------------|
| `backClick` | Emits when back button is clicked |

---

## ListStateComponent

Renders one of three placeholder states for list pages: loading bar, no-query hint (before first search), or empty results. Used by entity list components to keep state messaging consistent across pages.

```html
<list-state kind="no-query" />
<list-state kind="loading" loadingLabel="Fetching employees…" />
<list-state kind="empty" emptyTitle="No matching employees" emptyHint="Loosen the filters and search again." />
```

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `kind` | `'loading' \| 'no-query' \| 'empty'` | required | Which state to render |
| `loadingLabel` | `string` | `'Fetching records…'` | Label shown next to the loading bar |
| `noQueryHint` | `string` | `'Set filters above and press Search to retrieve records.'` | Hint shown in the no-query state |
| `emptyTitle` | `string` | `'No matching records'` | Title shown in the empty state |
| `emptyHint` | `string \| null` | `'Loosen the filters or clear them to try again.'` | Hint shown in the empty state; pass `null` to omit |

---

## BatchNavComponent

Compact prev/next/position indicator that auto-shows whenever `BatchOperationsService.isBatching` is `true`. Drop into an edit page header — no inputs needed; the component injects the service and renders nothing when there is no active batch.

```html
<batch-nav />
```

Renders `currentIndex + 1 / totalCount` plus disabled-aware Previous/Next buttons that call `goPrev()` / `goNext()`. See [BatchOperationsService](#batchoperationsservice) for the underlying queue mechanics.

---

## Dialog System

A consolidated dialog system built on a single native `<dialog>` element placed once in `AppComponent`. Domain-specific services open dialogs by passing a content component, a configuration object, and a callback. Content components communicate results back via an `@Input() resolve` callback — the service sets `instance.resolve = (data) => this.dialogHost.handleResult(data)` in the setup function, and the content component calls `this.resolve(data)` when done.

### Architecture

```
Caller (component/guard)      Domain Service         DialogHostService      DialogHostComponent      Content Component
       |                           |                        |                       |                       |
       |-- service.method() -----> |                        |                       |                       |
       |                           |-- open(component, ---> |                       |                       |
       |                           |     config, setup,     |                       |                       |
       |                           |     onResult)          |-- createComponent --> |                       |
       |                           |                        |-- show(config) -----> |-- showModal() ------> |
       |                           |                        |                       |                       |
       |                           |                        |     this.resolve(data) -----------------------> |
       |                           | <-- onResult(data) --- | <-- handleResult() - |                       |
       |                           |                        |-- hide() -----------> |-- close() ----------> |
       | <-- callback/Observable - |                        |                       |-- destroy content --> |
```

1. **Caller** invokes a domain service method (e.g. `confirmService.confirm(options)`)
2. **Domain service** calls `DialogHostService.open()` with a content component, config, optional setup function, and result callback
3. **DialogHostService** dynamically creates the content component in the host's `ViewContainerRef` outlet, applies setup (which sets `instance.resolve`), and shows the dialog
4. **Content component** does its work (form, list, etc.) and calls `this.resolve(data)` when done — the `resolve` callback was wired to `dialogHost.handleResult()` during setup
5. **DialogHostService** invokes the `onResult` callback, then closes and destroys the content

### DialogHostService

Central orchestrator. Manages host registration, dynamic component creation, and callback routing.

```typescript
import { DialogHostService, DialogConfig, DialogSize } from 'src/app/core/services/dialog-host.service';
```

**Types:**

```typescript
type DialogSize = 'sm' | 'md' | 'lg' | 'xl';

interface DialogConfig {
  title: string;
  titleIcon?: string;  // Bootstrap Icon class
  size?: DialogSize;    // defaults to 'md'
}
```

**API:**

| Method | Description |
|--------|-------------|
| `register(host)` | Called by `DialogHostComponent` on init |
| `unregister(host)` | Called by `DialogHostComponent` on destroy |
| `hasHost()` | Returns `true` if a host is registered |
| `open(component, config, setup?, onResult?)` | Creates content component, applies setup, shows dialog |
| `handleResult(data, options?)` | Invokes callback and closes dialog. Called by content component's `resolve` callback (or by host on `postMessage` for iframe dialogs) |
| `handleClose()` | Clears callback without invoking it. Called when dialog closes without a result |

### DialogHostComponent

Single `<dialog>` element in the DOM. Placed once in `app.component.html` as `<dialog-host />`.

**Size classes:**

| Size | CSS | Max Width |
|------|-----|-----------|
| `'sm'` | `dialog-sm` | 400px |
| `'md'` | (default) | 500px |
| `'lg'` | `dialog-lg` | 70vw |
| `'xl'` | `dialog-xl` | 90vw |

**Behavior:**
- Listens for `window.postMessage` events with `type: 'dialog-result'` from same origin
- Uses `NgZone.run()` to ensure Angular change detection runs after `postMessage` handling
- Records the trigger element on open and restores focus on close (pass `restoreFocus: false` in the postMessage options to suppress)
- Closes on backdrop click or close button
- Destroys content component outlet on close

**Accessibility (WCAG 2.1 AA):**
- Native `<dialog>` with `showModal()` provides built-in focus trapping, `aria-modal`, and Esc-to-close
- `aria-labelledby` links the dialog to its title heading
- Content is wrapped in `role="document"` for screen reader navigation
- Focus is restored to the trigger element on close (WCAG 2.4.3 Focus Order)
- Decorative icons include `aria-hidden="true"`
- Close button has `aria-label="Close"`

### Content Components

Pure presentation components that communicate results via an `@Input() resolve` callback. The domain service wires `instance.resolve = (data) => this.dialogHost.handleResult(data)` during setup, and the content component calls `this.resolve(data)` when the user makes a choice.

**resolve callback contract:**

```typescript
@Input() resolve: (data: any) => void = () => {};

// Called when the user completes an action:
this.resolve(resultData);

// For active filters, an optional second options argument controls focus restoration:
@Input() resolve: (data: any, options?: { restoreFocus?: boolean }) => void = () => {};
```

**Built-in content components:**

| Component | Purpose | Resolves with |
|-----------|---------|---------------|
| `ConfirmDialogContentComponent` | Confirm/Cancel with message and optional details list | `true` or `false` |
| `ActiveFiltersContentComponent` | Filter groups display with clickable items | `{ action: 'filter', filter }` or `{ action: 'tab', tabId }` |

**Iframe dialogs:** `DialogIframeComponent` uses `window.postMessage` for cross-origin communication instead of the `resolve` callback, since the content runs in a separate browsing context. `DialogHostComponent` still listens for `postMessage` events to handle this case.

### Creating a New Dialog Type

1. **Create a content component** with a `resolve` input:

```typescript
@Component({
  standalone: true,
  template: `<!-- your UI here -->`,
})
export class MyContentComponent {
  @Input() someData: string = '';
  @Input() resolve: (data: any) => void = () => {};

  onDone(result: any): void {
    this.resolve(result);
  }
}
```

2. **Create a domain service** that opens it:

```typescript
@Injectable({ providedIn: 'root' })
export class MyDialogService {
  private readonly dialogHost = inject(DialogHostService);

  open(data: string): Observable<MyResult | null> {
    if (!this.dialogHost.hasHost()) return of(null);

    return new Observable((subscriber) => {
      this.dialogHost.open(
        MyContentComponent,
        { title: 'My Dialog', titleIcon: 'bi bi-gear', size: 'lg' },
        (instance) => {
          instance.someData = data;
          instance.resolve = (result: MyResult) => this.dialogHost.handleResult(result);
        },
        (result: MyResult | null) => {
          subscriber.next(result);
          subscriber.complete();
        },
      );
    });
  }
}
```

---

## ConfirmDialogService

A service-driven confirmation dialog. Uses `DialogHostService` to open `ConfirmDialogContentComponent`.

**Service API:**

```typescript
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';

// Inject and call — returns Observable<boolean>
this.confirmService.confirm({
  title: 'Confirm Delete',
  titleIcon: 'bi bi-trash',
  message: 'Are you sure? This cannot be undone.',
  details: ['ID: 1', 'ID: 2'],
  confirmLabel: 'Delete',
  cancelLabel: 'Cancel',
  confirmClass: 'btn-danger',
}).subscribe(confirmed => {
  if (confirmed) { /* proceed */ }
});
```

**ConfirmDialogOptions:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | `string` | required | Dialog title |
| `titleIcon` | `string` | — | Bootstrap Icon class |
| `message` | `string` | required | Body text |
| `details` | `string[]` | — | Optional list of detailed items rendered as a scrollable `<ul>` below the message |
| `confirmLabel` | `string` | `'Confirm'` | Confirm button label |
| `cancelLabel` | `string` | `'Cancel'` | Cancel button label |
| `confirmClass` | `string` | `'btn-primary'` | CSS class for the confirm button |

**Built-in usage:**
- `unsavedChangesGuard` — shows "Unsaved Changes" dialog with Leave/Stay buttons (`btn-warning`) when navigating away from a dirty form
- Edit pages call `confirmService.confirm(DEFAULT_SAVE_DIALOG_CONFIG)` before saving
- Edit pages call `confirmService.confirm(DEFAULT_DELETE_DIALOG_CONFIG)` before deleting
- **"Delete Selected"** — list components build a visual `details` array of all selected values for the dialog

**Fallback:** When no `DialogHostComponent` is registered (`hasHost()` returns false), falls back to `window.confirm()`.

---

## ActiveFiltersDialogService

Service that opens the active filters dialog. Replaces the previous `ActiveFiltersDialogComponent` ViewChild pattern — no template reference needed.

```typescript
import { ActiveFiltersDialogService } from 'src/app/core/services/active-filters-dialog.service';

// In a list component
this.activeFiltersService.open(this.filterForm, this.filterConfig, this.hostRef);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `form` | `FormGroup` | The filter form to read values from |
| `filterConfig` | `Record<string, ActiveFilterConfig>` | Configuration object defining formatting, labels, and tab grouping |
| `container` | `ElementRef \| HTMLElement \| string` | Optional host element (or its `id`) used to scope focus after clicking a filter |

**How it works:**
- Collects active (non-empty) filter values from the form using `collectActiveFilters()`
- Groups filters by `tabId` into cards; each card header shows the `tabLabel` and is clickable
- Clicking a filter entry: switches the tab (via `aria-controls`), focuses the control, and closes the dialog
- Clicking a card header: switches the tab and closes the dialog without focusing a specific control
- Uses `restoreFocus: false` in the postMessage so the focused filter control is not overridden

**Tab switching convention:**

For automatic tab switching to work, add `aria-controls="tab-panel-<tabId>"` to each tab button and `id="tab-panel-<tabId>" role="tabpanel"` to each panel. Both the dialog and `FocusOnErrorDirective` find the matching button and click it programmatically — no event binding or parent handler required:

```html
<button class="nav-link" (click)="activeTab = 'personal'" aria-controls="tab-panel-personal">Personal</button>
<button class="nav-link" (click)="activeTab = 'contact'"  aria-controls="tab-panel-contact">Contact</button>

<div id="tab-panel-personal" role="tabpanel" [class.d-none]="activeTab !== 'personal'">...</div>
<div id="tab-panel-contact"  role="tabpanel" [class.d-none]="activeTab !== 'contact'">...</div>
```

Pages without tabs work as before — the dialog shows one ungrouped card with no header, and focus works without any `aria-controls` attributes.

**Wildcard paths for FormArray controls:**

When the filter form contains a `FormArray` (e.g. phone numbers), `collectActiveFilters()` replaces numeric array indices with `*` to match a single config entry. This allows one config key to cover all rows:

```typescript
const FILTER_CONFIG: Record<string, ActiveFilterConfig> = {
  // phones.0.number, phones.1.number, etc. all match this key:
  'phones.*.number': { label: 'Phone', format: 'phone' },
  'phones.*.label':  { label: 'Phone Label' },
};
```

The normalization regex `path.replace(/\.\d+(\.|$)/g, '.*$1')` converts `phones.0.number` to `phones.*.number` before config lookup.

**Object-typed filter values:** If a filter control holds a non-null object (e.g. a `LookupValue`) and the config provides neither `formatter` nor `format`, the control is **skipped** rather than rendered as `"[object Object]"`. Always supply a `formatter` for composite values:

```typescript
const FILTER_CONFIG: Record<string, ActiveFilterConfig> = {
  department: {
    label: 'Department',
    formatter: (v: LookupValue) => v.display ?? `#${v.id}`,
  },
};
```

---

## Lookup Dialogs

Lookup dialogs render the target entity's list component directly inside the dialog using `DialogHostService.open()` — the same mechanism used by confirm and active-filters dialogs. No iframe, no separate route, no token exchange.

**Data flow:**

```
LookupFormControl → openEntityLookup(dialogHost) → DialogHostService
    → EntityListComponent (mode='selection', rendered directly in dialog)
    → user clicks row → this.resolve(entity) → handleResult() → callback
← Observable → LookupFormControlComponent
```

Lookup openers are created using the `createLookupDialogOpener<TEntity>()` factory function from `core/services/lookup-dialog.factory.ts`. The factory returns a typed function `(dialogHost, options?) => Observable<TEntity | null>` that opens the list component via `DialogHostService.open()`, sets `mode = 'selection'` and wires `instance.resolve` to `dialogHost.handleResult()` in the setup callback. When the user clicks a row, the list component calls `this.resolve(entity)`, which triggers `handleResult()` and closes the dialog. Filters and disabled controls are applied directly to the component's `filterForm` in the setup callback.

**Adding a new lookup entity** requires two steps:

1. Define the opener in the entity's feature folder using the factory:

```typescript
// features/department/department-lookup.ts
import { createLookupDialogOpener } from '../../core/services/lookup-dialog.factory';
import { DepartmentListComponent } from './department-list.component';
import { Department } from './department.model';

export const openDepartmentLookup = createLookupDialogOpener<Department>({
  component: DepartmentListComponent,
  title: 'Select Department',
  titleIcon: 'bi bi-building',
});
```

2. Use it in the consuming component:

```typescript
private readonly dialogHost = inject(DialogHostService);

readonly departmentLookupFn = () =>
  openDepartmentLookup(this.dialogHost).pipe(
    map((dept) => (dept ? { id: dept.id, display: dept.name } : null)),
  );
```

The `LookupOptions` interface supports pre-filling filters (`filters`) and disabling specific filter fields (`disable`).

**Contract for list components:** Any list component can be used as a lookup target as long as it has:
- `@Input() mode: 'standalone' | 'selection'` — when `'selection'`, hides CRUD buttons, shows compact layout, and auto-searches on init
- `@Input() resolve: (data: TEntity) => void` — callback invoked when a row is clicked in selection mode

---

## BatchOperationsService

A service that consolidates batch operations for list and edit pages: sequential "Edit Selected" navigation and "Delete Selected" with confirmation. Located in `core/services/batch-edit.service.ts`.

**Batch Edit API:**

| Member | Type | Description |
|--------|------|-------------|
| `isBatching` | `boolean` (getter) | Whether a batch edit session is active |
| `currentIndex` | `number` (getter) | Zero-based index of the current item |
| `totalCount` | `number` (getter) | Total items in the batch queue |
| `currentRoute` | `any[] \| null` (getter) | The current route array, or `null` if not batching |
| `startBatch(routes, returnUrl)` | `void` | Begin batch editing; navigates to the first route |
| `hasNext()` | `boolean` | Whether there is a next item in the queue |
| `hasPrev()` | `boolean` | Whether there is a previous item in the queue |
| `goNext()` | `void` | Navigate to the next item |
| `goPrev()` | `void` | Navigate to the previous item |
| `finish()` | `void` | End the session and navigate to the return URL |
| `clear()` | `void` | Reset internal state without navigating |

**Batch Edit Workflow:**

1. **Start** from a list component: `batchOps.startBatch(routes, '/employees')`. This stores the queue and navigates to the first entity.
2. **Edit component** subscribes to `route.paramMap` (not `snapshot`) so the same component reloads data when the service navigates between items.
3. **On save**, call `goNext()` if `hasNext()`, otherwise `finish()` to return to the list.

**Template example (batch navigation header):**

```html
@if (batchOperationsService.isBatching) {
  <span>{{ batchOperationsService.currentIndex + 1 }} of {{ batchOperationsService.totalCount }}</span>
  <button [disabled]="!batchOperationsService.hasPrev()" (click)="batchOperationsService.goPrev()">Prev</button>
  <button [disabled]="!batchOperationsService.hasNext()" (click)="batchOperationsService.goNext()">Next</button>
}
```

> **Important:** Edit components must subscribe to `route.paramMap` (not read `route.snapshot.paramMap`) so that the same component instance reloads data when the service navigates between queue items without destroying and recreating the component.

**Batch Delete API:**

| Member | Type | Description |
|--------|------|-------------|
| `deleteSelected<T>(config)` | `Observable<{ deleted: boolean; count: number }>` | Confirm and delete selected records |

The `deleteSelected` method accepts a config object:

| Property | Type | Description |
|----------|------|-------------|
| `items` | `T[]` | Selected records (must have `id: number \| null`) |
| `formatDetail` | `(item: T) => string` | Formats each item for the confirmation dialog details list |
| `deleteFn` | `(ids: number[]) => Observable<void>` | The actual delete call (e.g. `entityService.deleteMany`) |

The service handles the empty check, detail truncation (max 10 items), confirmation dialog, and calling `deleteFn`. Items with `id == null` (unsaved rows) are filtered out **before** the confirmation dialog, so the count shown to the user always matches the number of records actually deleted. The component controls what happens after deletion (toast, clearing selection, re-searching).

**Batch Delete Usage:**

```typescript
onDeleteSelected(): void {
  this.batchOps
    .deleteSelected({
      items: this.selectedEmployees,
      formatDetail: (e) => `ID: ${e.id} - ${e.firstName}`,
      deleteFn: (ids) => this.employeeService.deleteMany(ids),
    })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((result) => {
      if (!result.deleted) return;
      this.toastService.success(`${result.count} record(s) deleted`);
      this.selectedEmployees = [];
      this.onSearch();
    });
}
```

## DialogIframeComponent

Renders a sandboxed `<iframe>` for embedding external micro-frontend pages. Handles cross-origin communication via `postMessage` for token exchange and result passing.

```html
<!-- Used inside a content component rendered by DialogHostService -->
<dialog-iframe
  src="https://other-app.com/item-picker"
  origin="https://other-app.com"
  [token]="auth.currentUser?.token ?? ''"
  height="600px"
  (result)="onItemPicked($event)"
  (ready)="onIframeReady()"
/>
```

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `src` | `string` | required | URL of the external page |
| `origin` | `string` | required | Allowed origin for `postMessage` validation |
| `token` | `string` | — | Auth token sent to the iframe after it signals readiness |
| `width` | `string` | `'100%'` | Iframe width |
| `height` | `string` | `'500px'` | Iframe height |
| `iframeTitle` | `string` | `'External content'` | Accessible title for the iframe element |

| Output | Type | Description |
|--------|------|-------------|
| `result` | `EventEmitter<unknown>` | Emits data from the iframe's `postMessage` |
| `ready` | `EventEmitter<void>` | Emits when the iframe signals it is ready |

**Message protocol:**

```typescript
// Iframe → Host
{ type: 'ready' }                    // iframe loaded, requesting token
{ type: 'result', data: any }        // iframe sending back a selection/result

// Host → Iframe
{ type: 'token', token: string }     // host sending auth token
```

**Security:**
- `sandbox="allow-scripts allow-same-origin allow-forms"` restricts iframe capabilities
- Every incoming `postMessage` is validated against the `origin` input
- Token is sent via `postMessage` (not URL params) to avoid exposure in browser history or logs
