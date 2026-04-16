import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Action, AuthUser, Permission, RecordType } from './auth.types';

const ALL_ACTIONS: Action[] = ['read', 'create', 'edit', 'delete'];
const ALL_RECORD_TYPES: RecordType[] = ['employee', 'department'];

const MOCK_USERS: AuthUser[] = [
  {
    username: 'admin',
    displayName: 'Admin User',
    permissions: ALL_RECORD_TYPES.flatMap((recordType) =>
      ALL_ACTIONS.map((action): Permission => ({ recordType, action })),
    ),
  },
  {
    username: 'viewer',
    displayName: 'View-Only User',
    permissions: ALL_RECORD_TYPES.map(
      (recordType): Permission => ({ recordType, action: 'read' }),
    ),
  },
  {
    username: 'employee-manager',
    displayName: 'Employee Manager',
    permissions: ALL_ACTIONS.map((action): Permission => ({ recordType: 'employee', action })),
  },
];

@Injectable({ providedIn: 'root' })
export class MockAuthApi {
  getAvailableUsers(): Observable<{ username: string; displayName: string }[]> {
    return of(MOCK_USERS.map(({ username, displayName }) => ({ username, displayName }))).pipe(
      delay(200)
    );
  }

  login(username: string): Observable<AuthUser | null> {
    const user = MOCK_USERS.find((u) => u.username === username) ?? null;
    return of(user).pipe(delay(200));
  }
}
