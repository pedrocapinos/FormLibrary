# Architecture
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/architecture.pt-BR.md)

## Layers

```
src/app/
├── core/                   # The reusable library
│   ├── components/         # Form controls, table, header, dialog host, content components
│   ├── directives/         # Behavioral directives
│   ├── masks/              # Maskito mask definitions and utilities
│   ├── services/           # Error messaging, search state, dialog host, domain dialogs
│   ├── utils/              # Pure helper functions (active filters, focus, form comparison, export)
│   ├── validators/         # Cross-field validator factories
│   └── types/              # Shared TypeScript interfaces
│
├── features/               # Concrete entity implementations
│   ├── employee/
│   ├── department/
│   ├── playground/         # Interactive component explorer / demo page
│   ├── login/              # Login page
│   ├── not-found/          # 404 page
│   └── unauthorized/       # 403 page
│
└── app.*                   # Shell: routing, navigation, config
```

## Form Pattern

Each entity defines a TypeScript interface and a form factory function. Simple forms are flat, matching the entity interface directly. When multiple cross-field validators coexist on the same form, related controls are grouped into `FormGroup` sub-groups that act as **validation boundaries** — each group validator only affects its own group, preventing error cross-contamination between compound components.

```typescript
// entity.model.ts — flat interface
export interface EmployeePhone {
  label: string | null;
  number: string | null;
}

export interface Employee {
  id: number | null;
  firstName: string | null;
  cpf: string | null;
  salary: number | null;
  isActive: boolean;
  departmentId: number | null;
  departmentName: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  isPrimary: boolean;
  phones: EmployeePhone[];
}
```

```typescript
// entity-edit.component.ts — nested form with validator scoping
buildEmployeeForm(employee?: Partial<Employee>) {
  return this.fb.group({
    identity: this.fb.group({
      id: this.fb.control<number | null>(employee?.id ?? null, [
        Validators.min(0), Validators.max(9999),
      ]),
      cpf: this.fb.control<string | null>(employee?.cpf ?? null),
    }, { validators: [createAtLeastOneRequiredValidator(['id', 'cpf'])] }),
    firstName: this.fb.control<string | null>(employee?.firstName ?? null, [
      Validators.minLength(3), Validators.maxLength(100), Validators.required,
    ]),
    salary: this.fb.control<number | null>(employee?.salary ?? null),
    isActive: this.fb.control<boolean | null>(employee?.isActive ?? null),
    department: this.fb.control<LookupValue | null>(
      employee?.departmentId ? { id: employee.departmentId, display: employee.departmentName ?? null } : null,
    ),
    address: this.fb.group({
      street: this.fb.control<string | null>(employee?.street ?? null),
      city: this.fb.control<string | null>(employee?.city ?? null),
      state: this.fb.control<string | null>(employee?.state ?? null),
      zip: this.fb.control<string | null>(employee?.zip ?? null),
      isPrimary: this.fb.control<boolean>(employee?.isPrimary ?? false),
    }, { validators: [createAtLeastOneRequiredValidator(['street', 'city', 'state', 'zip'])] }),
    phones: this.fb.array((employee?.phones ?? []).map((p) => this.buildPhoneRowGroup(p))),
  }, { updateOn: 'blur' });
}
```

When the form shape differs from the flat model interface, a `formToModel()` method flattens the nested groups back to the model:

```typescript
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
```

**When to use FormGroups vs flat forms:** If a form has only one cross-field validator (e.g. the employee list filter with just a range validator), a flat form is fine — there's no cross-contamination risk. FormGroups are needed when **multiple** group-level validators coexist and compound components (like `RangeCurrencyFormControlComponent` or `AddressFormControlComponent`) would otherwise see each other's errors via `ControlContainer`.

Filter forms follow the same flat pattern but live in a dedicated `entity.filter.ts` file.

## Technology Stack

| Concern | Choice |
|---------|--------|
| Framework | Angular 17+ (standalone components, `@if`/`@for` control flow) |
| Forms | Reactive Forms (typed, Angular 14+) |
| Input masking | [Maskito](https://maskito.dev) |
| Table | Angular CDK (`cdk-table`, drag-drop) |
| Styling | Bootstrap 5 |
| XLSX export | SheetJS |
| PDF export | jsPDF |
