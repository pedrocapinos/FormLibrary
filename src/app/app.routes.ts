import { Routes } from '@angular/router';
import { authGuard, permissionGuard } from './core/auth/auth.guard';
import { unsavedChangesGuard } from './core/auth/unsaved-changes.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'employees', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./features/unauthorized/unauthorized.component').then((m) => m.UnauthorizedComponent),
  },
  {
    path: 'playground',
    loadComponent: () =>
      import('./features/playground/playground.component').then((m) => m.PlaygroundComponent),
    canActivate: [authGuard],
  },
  {
    path: 'employees',
    loadComponent: () =>
      import('./features/employee/employee-list.component').then((m) => m.EmployeeListComponent),
    canActivate: [authGuard, permissionGuard],
    data: { recordType: 'employee', action: 'read' },
  },
  {
    path: 'employees/new',
    loadComponent: () =>
      import('./features/employee/employee-edit.component').then((m) => m.EmployeeEditComponent),
    canActivate: [authGuard, permissionGuard],
    canDeactivate: [unsavedChangesGuard],
    data: { recordType: 'employee', action: 'create' },
  },
  {
    path: 'employees/:id',
    loadComponent: () =>
      import('./features/employee/employee-edit.component').then((m) => m.EmployeeEditComponent),
    canActivate: [authGuard, permissionGuard],
    canDeactivate: [unsavedChangesGuard],
    data: { recordType: 'employee', action: 'read' },
  },
  {
    path: 'departments',
    loadComponent: () =>
      import('./features/department/department-list.component').then(
        (m) => m.DepartmentListComponent,
      ),
    canActivate: [authGuard, permissionGuard],
    data: { recordType: 'department', action: 'read' },
  },
  {
    path: 'departments/new',
    loadComponent: () =>
      import('./features/department/department-edit.component').then(
        (m) => m.DepartmentEditComponent,
      ),
    canActivate: [authGuard, permissionGuard],
    canDeactivate: [unsavedChangesGuard],
    data: { recordType: 'department', action: 'create' },
  },
  {
    path: 'departments/:id',
    loadComponent: () =>
      import('./features/department/department-edit.component').then(
        (m) => m.DepartmentEditComponent,
      ),
    canActivate: [authGuard, permissionGuard],
    canDeactivate: [unsavedChangesGuard],
    data: { recordType: 'department', action: 'read' },
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
