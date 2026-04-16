# Authentication & Authorization
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/authentication.pt-BR.md)

A mock auth system that protects routes and controls UI visibility based on user permissions. Designed to mirror real-world auth patterns (guards, permission checks, read-only mode) so that swapping in a real auth provider requires minimal changes.

## Concepts

| Term | Description |
|------|-------------|
| `RecordType` | `'employee' \| 'department'` — the entity being accessed |
| `Action` | `'read' \| 'create' \| 'edit' \| 'delete'` — what the user wants to do |
| `Permission` | A `{ recordType, action }` pair granted to a user |

## AuthService

Singleton service that holds the current user and their permissions in memory. Session-based — resets on page reload, redirecting to the login page.

```typescript
import { AuthService } from 'src/app/core/auth/auth.service';
```

**API:**

| Member | Type | Description |
|--------|------|-------------|
| `currentUser` | `AuthUser \| null` | The logged-in user, or `null` |
| `isAuthenticated` | `boolean` | Whether a user is logged in |
| `login(username)` | `Observable<AuthUser \| null>` | Authenticates and caches user + permissions |
| `logout()` | `void` | Clears the current user |
| `can(recordType, action)` | `boolean` | Checks if the current user has a specific permission |

No signals or observables needed in templates — `isAuthenticated` and `can()` are synchronous getters/methods that work with standard change detection.

## Route Guards

Two functional guards protect routes:

```typescript
import { authGuard, permissionGuard } from 'src/app/core/auth/auth.guard';
```

- **`authGuard`** — redirects to `/login` if not authenticated
- **`permissionGuard`** — reads `recordType` and `action` from `route.data`, redirects to `/unauthorized` if denied

**Route configuration:**
```typescript
{ path: '', redirectTo: 'employees', pathMatch: 'full' },
{ path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
{ path: 'unauthorized', loadComponent: () => import('./features/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent) },
{ path: 'playground', loadComponent: () => ..., canActivate: [authGuard] },
{
  path: 'employees',
  loadComponent: () => import('./features/employee/employee-list.component').then(m => m.EmployeeListComponent),
  canActivate: [authGuard, permissionGuard],
  data: { recordType: 'employee', action: 'read' },
},
{
  path: 'employees/new',
  canActivate: [authGuard, permissionGuard],
  canDeactivate: [unsavedChangesGuard],
  data: { recordType: 'employee', action: 'create' },
  // ...
},
{
  path: 'employees/:id',
  canActivate: [authGuard, permissionGuard],
  canDeactivate: [unsavedChangesGuard],
  data: { recordType: 'employee', action: 'read' },  // read, not edit — read-only users can view
  // ...
},
// Department routes follow the same pattern with recordType: 'department'
{ path: 'departments', /* ... */ data: { recordType: 'department', action: 'read' } },
{ path: 'departments/new', /* ... */ data: { recordType: 'department', action: 'create' } },
{ path: 'departments/:id', /* ... */ data: { recordType: 'department', action: 'read' } },
// 404 wildcard (must be last)
{ path: '**', loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent) },
```

## Template-Level Permission Checks

Each component declares its `recordType` and implements a `can()` method that delegates to `AuthService.can()`:

```typescript
// employee-list.component.ts
readonly recordType: RecordType = 'employee';

can(action: Action): boolean {
  return this.auth.can(this.recordType, action);
}
```

```html
<!-- Single parameter — checks against the current recordType -->
@if (can('create')) {
  <button (click)="onNew()">New Employee</button>
}

@if (can('edit') || isNew) {
  <button type="submit">Save</button>
}

@if (!isNew && can('delete')) {
  <button (click)="onDelete()">Delete</button>
}
```

## Read-Only Mode

Edit pages with `read`-only permission show the record but disable interaction:

- The form is disabled via `this.form.disable()` when the user lacks `edit` permission
- Save and Delete buttons are hidden
- The page title adapts: "View Employee" instead of "Edit Employee"

## Mock Users

| Username | Display Name | Permissions |
|----------|-------------|-------------|
| `admin` | Admin User | All actions on all record types (`employee`, `department`) |
| `viewer` | View-Only User | `read` only on all record types |
| `employee-manager` | Employee Manager | All actions on `employee` only |

## MockAuthApi

Injectable service that simulates the auth backend. Returns user data with a 200ms delay.

```typescript
import { MockAuthApi } from 'src/app/core/auth/mock-auth.api';
```

| Method | Description |
|--------|-------------|
| `getAvailableUsers()` | Returns usernames and display names (no permissions) |
| `login(username)` | Returns the full `AuthUser` with permissions, or `null` |

To swap in a real auth provider, replace `MockAuthApi` with a service that calls your actual API — the `AuthService`, guards, and component `can()` wrappers remain unchanged.
