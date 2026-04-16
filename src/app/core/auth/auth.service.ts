import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Action, AuthUser, RecordType } from './auth.types';
import { MockAuthApi } from './mock-auth.api';
import { SearchStateService } from '../services/search-state.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(MockAuthApi);
  private readonly searchState = inject(SearchStateService);
  private _currentUser: AuthUser | null = null;

  get currentUser(): AuthUser | null {
    return this._currentUser;
  }

  get isAuthenticated(): boolean {
    return this._currentUser !== null;
  }

  login(username: string): Observable<AuthUser | null> {
    return this.api.login(username).pipe(tap((user) => (this._currentUser = user)));
  }

  logout(): void {
    this._currentUser = null;
    this.searchState.clearAll();
  }

  can(recordType: RecordType, action: Action): boolean {
    if (!this._currentUser) return false;
    return this._currentUser.permissions.some(
      (p) => p.recordType === recordType && p.action === action
    );
  }
}
