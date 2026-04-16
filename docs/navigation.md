# Cross-Cutting Navigation
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/navigation.pt-BR.md)

Six navigation features that work together with the auth system to provide a complete routing experience.

## 1. Unsaved Changes Guard

Prevents users from accidentally leaving an edit page with unsaved work. Uses a `canDeactivate` guard that performs a deep comparison of the current form values against the original record values (using `structuredClone` + `JSON.stringify`), rather than relying on the form's `dirty` flag.

```typescript
import { unsavedChangesGuard, HasUnsavedChanges } from 'src/app/core/auth/unsaved-changes.guard';
```

**Interface:** Edit components must implement `HasUnsavedChanges`:

```typescript
interface HasUnsavedChanges {
  form: FormGroup;
  saving: boolean;              // Skip prompt during form submission
  deleting: boolean;            // Skip prompt during delete
  hasUnsavedChanges(): boolean; // Deep comparison of current vs original values
}
```

**Implementation in edit components:**
```typescript
// When form shape matches model shape (flat form):
private originalValues = structuredClone(this.form.getRawValue());
hasUnsavedChanges(): boolean {
  return JSON.stringify(this.form.getRawValue()) !== JSON.stringify(this.originalValues);
}

// When form uses sub-groups (nested form with mapping layer):
private originalModel: Employee = this.formToModel();
hasUnsavedChanges(): boolean {
  return JSON.stringify(this.formToModel()) !== JSON.stringify(this.originalModel);
}
```

**Route configuration:**
```typescript
{
  path: 'employees/:id',
  canDeactivate: [unsavedChangesGuard],
  // ...
}
```

**Behavior:**
- No changes detected (values match original) → navigation allowed silently
- Changes detected → `ConfirmDialogService` asks the user to confirm leaving
- `saving` or `deleting` is `true` → navigation allowed silently (form submission in progress)
- Editing a field back to its original value → no prompt (unlike `dirty` flag which stays true)

## 2. Deep Linking After Login

When an unauthenticated user tries to access a protected route, `authGuard` redirects to `/login` with the intended URL preserved as a `returnUrl` query parameter. After successful login, the user is redirected to their original destination instead of a default page.

**Flow:**
1. User visits `/employees/42` → `authGuard` redirects to `/login?returnUrl=/employees/42`
2. Login page reads `returnUrl` from `ActivatedRoute.snapshot.queryParams`
3. After `AuthService.login()` succeeds, `router.navigateByUrl(returnUrl)` sends the user to `/employees/42`
4. If no `returnUrl` is present, falls back to `/employees`

## 3. Permission-Aware Sidebar

The sidebar navigation in `AppComponent` conditionally renders links based on the current user's permissions:

```html
@if (auth.isAuthenticated) {
  <!-- sidebar content -->
  @if (auth.can('employee', 'read')) {
    <a routerLink="/employees">Employees</a>
  }
}
```

Users only see links to pages they have at least `read` permission for. The entire sidebar is hidden on the login page.

## 4. Return-to-Origin Navigation

`NavigationService` provides a one-shot return URL pattern so that "Back" buttons on edit pages return the user to wherever they came from, not a hardcoded route. List and edit components use `NavigationService` together with `Router` and `BatchOperationsService` directly.

```typescript
import { NavigationService } from 'src/app/core/services/navigation.service';
```

**API:**

| Method | Description |
|--------|-------------|
| `setReturnUrl(url)` | Store the return URL (called by the list before navigating to edit) |
| `consumeReturnUrl()` | Retrieve and clear the return URL; returns `null` if not set |
| `returnUrl` (getter) | Read the current return URL without consuming it |

**Usage in list components:**
```typescript
onRowClick(employee: Employee): void {
  this.navigationService.setReturnUrl('/employees');
  this.router.navigate(['/employees', employee.id]);
}
```

**Usage in edit components:**
```typescript
private returnUrl = '/employees'; // fallback

ngOnInit() {
  this.returnUrl = this.navigationService.consumeReturnUrl() ?? '/employees';
}

onBack() {
  if (this.batchOperationsService.isBatching) {
    this.batchOperationsService.finish();
    return;
  }
  this.router.navigateByUrl(this.returnUrl);
}
```

The `consumeReturnUrl()` pattern ensures the URL is used only once — subsequent reads return `null`, preventing stale navigation.

## 5. 404 Not Found Page

A wildcard route (`**`) catches all unmatched URLs and displays a styled "Page Not Found" page with a link back to the home page.

```typescript
// app.routes.ts
{ path: '**', loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent) }
```

This route must be the last entry in the routes array.

## 6. Loading Indicator

`AppComponent` subscribes to router events to show a thin progress bar at the top of the content area during route transitions — the same pattern used by GitHub and YouTube. The bar is absolutely positioned inside `<main>`, so it causes no layout shift.

```typescript
navigating = false;

ngOnInit() {
  this.routerSub = this.router.events.subscribe(event => {
    if (event instanceof NavigationStart) this.navigating = true;
    else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
      this.navigating = false;
    }
  });
}
```

```html
<main class="flex-grow-1 overflow-auto position-relative">
  @if (navigating) {
    <div class="route-loading-bar"></div>
  }
  <router-outlet />
</main>
```

The `.route-loading-bar` is a 3px-high bar with a CSS-only indeterminate sliding animation. It appears during lazy-loaded route transitions and guard resolution, and hides on `NavigationEnd`, `NavigationCancel`, or `NavigationError`. The subscription is cleaned up in `ngOnDestroy`.
