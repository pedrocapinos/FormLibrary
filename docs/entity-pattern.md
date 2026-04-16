# Entity Pattern
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/entity-pattern.pt-BR.md)

## Architecture: Composition over Inheritance

CRUD page components use **composition** (injected services + pure functions) instead of inheriting from a shared base class. This is a deliberate design choice.

**The problem with a base class (`BaseCrudPage`)**

An abstract base class that bundles navigation, auth, dialogs, and batch delete into one parent seems convenient — child components just call `super.can()` or `this.confirmSave()`. But it creates real problems:

- **Tight coupling** — every component inherits all dependencies (7+), even if it only uses 2. Adding a method to the base ripples into every child.
- **Fragile base class** — a change in the parent can silently break any child component that extends it. The inheritance chain is a single point of failure.
- **Opaque dependencies** — reading a component, you can't tell what services it actually needs without tracing up the inheritance chain.
- **Single inheritance** — TypeScript only allows one `extends`. If two unrelated behaviors both seem like "base class material," you're stuck.
- **Harder to test** — mocking a base class means mocking everything it drags in, even for a test that only cares about one behavior.

**The current approach**

Shared behavior is split by concern into the right Angular primitive:

| Concern | Primitive | Why |
|---|---|---|
| Return URL tracking | `NavigationService` (injectable) | Simple set/consume pattern for return-to-origin navigation |
| Batch edit queue | `BatchOperationsService` (injectable) | Manages sequential navigation through selected records |
| Batch delete flow | `BatchOperationsService.deleteSelected()` | Confirm → delete → result observable; component controls post-delete behavior |
| Permission checks | Direct `this.auth.can()` call | One-liner — a wrapper function adds indirection without abstraction |
| Save/delete confirmation | Direct `confirmService.confirm()` call | One-liner with a shared config constant |
| Unsaved changes detection | Inline `JSON.stringify` comparison against an `originalModel`/`originalValues` snapshot | Trivial one-liner per component — no helper needed |

**Guiding principle:** side-effectful logic goes in Angular services (proper DI, testable, lifecycle-aware). Pure data transformations go in exported functions. Thin wrappers that just rename a method call get inlined.

## Recommended File Structure

```
features/entity/
  entity.model.ts          # Interface (form builder lives in the component)
  entity.filter.ts         # Filter interface
  entity.service.ts        # CRUD operations returning Observable<Entity>
  entity-list.component.ts # Search/filter page
  entity-list.component.html
  entity-edit.component.ts # Create/edit page
  entity-edit.component.html
```

## How a List Page Is Composed

```typescript
@Component({ /* ... */ })
export class EmployeeListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly searchStateService = inject(SearchStateService);
  private readonly batchOps = inject(BatchOperationsService);
  private readonly navigationService = inject(NavigationService);
  private readonly toastService = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formatService = inject(FormatService);

  readonly recordType: RecordType = 'employee';

  filterForm = this.buildFilterForm();
  data: Employee[] | null = null;
  selectedEmployees: Employee[] = [];
  loading = false;
  columns: ColumnDefinition<Employee>[] = [ /* ... */ ];

  can(action: Action): boolean {
    return this.auth.can(this.recordType, action);
  }

  ngOnInit() {
    const saved = this.searchStateService.restore<EmployeeSearchFilters>('/employees');
    if (saved) {
      this.filterForm.patchValue(saved);
      this.onSearch();
    }
  }

  onSearch() {
    this.searchStateService.save('/employees', this.filterForm.value);
    this.loading = true;
    this.employeeService.search(this.filterForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(results => {
        this.data = results;
        this.loading = false;
      });
  }

  onRowClick(employee: Employee) {
    this.navigationService.setReturnUrl('/employees');
    this.router.navigate(['/employees', employee.id]);
  }

  onNew() {
    this.navigationService.setReturnUrl('/employees');
    this.router.navigate(['/employees', 'new']);
  }

  onEditSelected() {
    const routes = this.selectedEmployees.map(s => ['/employees', s.id!]);
    this.batchOps.startBatch(routes, this.router.url);
  }

  onDeleteSelected() {
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
}
```

```html
<generic-header title="Employees">
  <button class="btn btn-primary" (click)="onNew()">New</button>
  <button type="button" (click)="activeFiltersService.open(filterForm, filterConfig, filterFormEl)">
    Active Filters
  </button>
</generic-header>

<form [formGroup]="filterForm" #filterFormEl (ngSubmit)="onSearch()">
  <!-- filter controls -->
  <button type="submit">Search</button>
</form>

<generic-table [columns]="columns" [data]="data ?? []" [pageSize]="10"
  [selectable]="true" [reorderableColumns]="true"
  [filterForm]="filterForm" [filterConfig]="filterConfig"
  (rowClick)="onRowClick($event)" />
```

## How an Edit Page Is Composed

```typescript
@Component({ ... })
export class EmployeeEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly navigationService = inject(NavigationService);
  private readonly confirmService = inject(ConfirmDialogService);
  private readonly toastService = inject(ToastService);

  readonly recordType: RecordType = 'employee';
  readonly batchOperationsService = inject(BatchOperationsService); // template binding

  form = this.buildEmployeeForm();
  isNew = true;
  saving = false;
  deleting = false;
  private returnUrl = '/employees';
  private originalModel: Employee = this.formToModel();

  can(action: Action): boolean {
    return this.auth.can(this.recordType, action);
  }

  hasUnsavedChanges(): boolean {
    return JSON.stringify(this.formToModel()) !== JSON.stringify(this.originalModel);
  }

  ngOnInit() {
    this.returnUrl = this.navigationService.consumeReturnUrl() ?? '/employees';
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const id = params.get('id');
      this.isNew = id === null || id === 'new';
      if (!this.isNew) {
        this.employeeService.getById(+id!)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(s => {
            this.form = this.buildEmployeeForm(s);
            this.originalModel = this.formToModel();
            if (!this.can('edit')) {
              this.form.disable();
            }
          });
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.confirmService.confirm(DEFAULT_SAVE_DIALOG_CONFIG)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(confirmed => {
        if (!confirmed) return;
        this.saving = true;
        this.employeeService.save(this.formToModel())
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(saved => {
            this.form = this.buildEmployeeForm(saved);
            this.originalModel = this.formToModel();
            this.toastService.success('Employee saved successfully');
            if (this.batchOperationsService.isBatching) {
              if (this.batchOperationsService.hasNext()) {
                this.batchOperationsService.goNext();
              } else {
                this.batchOperationsService.finish();
              }
              this.saving = false;
              return;
            }
            if (this.isNew) {
              this.isNew = false;
              this.router.navigate(['/employees', saved.id!], { replaceUrl: true });
            }
            this.saving = false;
          });
      });
  }

  // Flattens nested form groups back to the flat model interface
  private formToModel(): Employee {
    const raw = this.form.getRawValue();
    return {
      id: raw.identity.id,
      firstName: raw.firstName,
      cpf: raw.identity.cpf,
      salary: raw.salary,
      isActive: raw.isActive ?? false,
      departmentId: raw.department?.id ?? null,
      departmentName: raw.department?.display ?? null,
      street: raw.address.street,
      city: raw.address.city,
      state: raw.address.state,
      zip: raw.address.zip,
      isPrimary: raw.address.isPrimary ?? false,
      phones: raw.phones,
    };
  }

  onBack() {
    if (this.batchOperationsService.isBatching) {
      this.batchOperationsService.finish();
      return;
    }
    this.router.navigateByUrl(this.returnUrl);
  }
}
```

```html
<form [formGroup]="form" appFocusOnError (ngSubmit)="onSubmit()">
  <div formGroupName="identity">
    <code-form-control formControlName="id" label="ID"
      [customMessages]="idMessages" [groupInvalid]="identityGroupInvalid" />
    <cpf-form-control formControlName="cpf" label="CPF"
      [groupInvalid]="identityGroupInvalid" />
    <error-message [control]="form.controls.identity" label="identification field (ID or CPF)" />
  </div>

  <text-form-control formControlName="firstName" label="First Name" />
  <currency-form-control formControlName="salary" label="Salary" />
  <checkbox-form-control formControlName="isActive" label="Active" />
  <lookup-form-control formControlName="department" label="Department"
    [lookupFn]="departmentLookupFn" [lookupByIdFn]="departmentLookupByIdFn" />

  <div formGroupName="address">
    <address-form-control />
  </div>

  <dynamic-rows [formArray]="form.controls.phones" [createRow]="createPhoneRow"
    addLabel="Add Phone" emptyMessage="No phone numbers added yet.">
    <ng-template let-group let-index="index">
      <div [formGroup]="group" class="row g-2">
        <div class="col-md-4">
          <text-form-control formControlName="label" label="Label" />
        </div>
        <div class="col-md-8">
          <phone-form-control formControlName="number" label="Number" />
        </div>
      </div>
    </ng-template>
  </dynamic-rows>
</form>
```

**Clear button behavior:** On a new page, Clear rebuilds the form empty (`this.form = this.buildEmployeeForm()`). On an edit page, Clear rebuilds from the original record (`this.form = this.buildEmployeeForm(this.originalModel)`). Rebuilding (rather than `form.reset()`) is required because `FormArray.reset()` only resets values without adding or removing rows — see [DynamicRowsComponent clear behavior](./core-form-controls.md#dynamicrowscomponent). In both cases the new form is pristine, so the unsaved-changes guard won't prompt. The button is hidden for view-only users (same `can('edit') || isNew` guard as Save).
