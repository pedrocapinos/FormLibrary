# Example Entity
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/example-entity.pt-BR.md)

## Employee

```typescript
interface EmployeePhone {
  label: string | null;
  number: string | null;
}

interface Employee {
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

**Form validators:** `id` — min 0, max 9999 (with per-field custom messages) · `firstName` — minLength 3, maxLength 100, required

**Cross-field validators (FormGroup-scoped):** `identity` sub-group — `createAtLeastOneRequiredValidator` (at least one of id, cpf) · `address` sub-group — `createAtLeastOneRequiredValidator` (at least one of street, city, state, zip)

**Filter form:** `id`, `firstName`, salary range bounds (`salaryMin`/`salaryMax`) with `createRangeValidator`, `isActive` checkbox

**Controls used:** `code-form-control` (ID), `text-form-control` (first name), `cpf-form-control` (CPF), `currency-form-control` (salary), `checkbox-form-control` (active), `lookup-form-control` (department), `address-form-control` (address fieldset), `dynamic-rows` (phones with label and number per row)

The Employee entity has an in-memory service powered by [`@faker-js/faker`](https://fakerjs.dev) with a fixed seed (reproducible on every restart): 50 employees. Network calls are simulated with a 200ms delay.

**MockSeedService** (`src/app/features/mock-seed.service.ts`) is the singleton that owns the seed data for both `employee.service.ts` and `department.service.ts`. It seeds 15 departments first (`DEPARTMENT_SEED = 99`), then 50 employees (`EMPLOYEE_SEED = 42`) with ~70% chance of being assigned to a random department. Both services inject this provider and serve mutations against its arrays, so cross-entity references stay consistent (an employee's `departmentId` always resolves to a real department). Replace this service with HTTP-backed implementations to wire up a real backend — the entity services are the only callers.

## Component Playground

An interactive demo page at `/playground` that lets you explore every form control in the library. Organized into four tabs:

| Tab | Components |
|---|---|
| **Text & Masked** | `text-form-control`, `cpf-form-control`, `cnpj-form-control`, `phone-form-control`, `date-form-control` |
| **Numeric** | `code-form-control`, `currency-form-control` |
| **Selection** | `select-form-control`, `checkbox-form-control` |
| **Compound** | `range-currency-form-control`, `address-form-control` |

Each component card has a live **Configuration** panel where you can toggle properties (`disabled`, `required`, `maxLength`, `padded`, `fractionDigits`, `min`/`max`, `placeholder`, etc.) and see the effect in real time. The page also includes:

- **Form Value** panel — sticky right-side card with live JSON view of `form.getRawValue()` and a valid/invalid status badge
- **Active Filters dialog** — test the active-filters feature against the playground form
- **Submit** — marks all controls as touched to trigger validation display
- **Clear** — resets the entire form
