import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { MockAuthApi } from './mock-auth.api';
import { SearchStateService } from '../services/search-state.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should start unauthenticated', () => {
    expect(service.isAuthenticated).toBe(false);
    expect(service.currentUser).toBeNull();
  });

  it('should authenticate after login', (done) => {
    service.login('admin').subscribe((user) => {
      expect(user).not.toBeNull();
      expect(service.isAuthenticated).toBe(true);
      expect(service.currentUser?.username).toBe('admin');
      done();
    });
  });

  it('should return null for unknown username', (done) => {
    service.login('nonexistent').subscribe((user) => {
      expect(user).toBeNull();
      expect(service.isAuthenticated).toBe(false);
      done();
    });
  });

  it('should clear user on logout', (done) => {
    service.login('admin').subscribe(() => {
      service.logout();
      expect(service.isAuthenticated).toBe(false);
      expect(service.currentUser).toBeNull();
      done();
    });
  });

  describe('can()', () => {
    it('should return false when not authenticated', () => {
      expect(service.can('employee', 'read')).toBe(false);
    });

    it('should return true for granted permission (admin)', (done) => {
      service.login('admin').subscribe(() => {
        expect(service.can('employee', 'read')).toBe(true);
        expect(service.can('employee', 'edit')).toBe(true);
        expect(service.can('employee', 'create')).toBe(true);
        expect(service.can('employee', 'delete')).toBe(true);
        done();
      });
    });

    it('should return false for denied permission (viewer)', (done) => {
      service.login('viewer').subscribe(() => {
        expect(service.can('employee', 'read')).toBe(true);
        expect(service.can('employee', 'edit')).toBe(false);
        expect(service.can('employee', 'create')).toBe(false);
        expect(service.can('employee', 'delete')).toBe(false);
        done();
      });
    });

    it('should reset permissions after logout', (done) => {
      service.login('admin').subscribe(() => {
        expect(service.can('employee', 'edit')).toBe(true);
        service.logout();
        expect(service.can('employee', 'edit')).toBe(false);
        done();
      });
    });
  });

  it('should clear search state on logout', (done) => {
    const searchState = TestBed.inject(SearchStateService);
    searchState.save('/employees', { id: 1 });

    service.login('admin').subscribe(() => {
      service.logout();
      expect(searchState.restore('/employees')).toBeNull();
      done();
    });
  });
});

describe('MockAuthApi', () => {
  let api: MockAuthApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    api = TestBed.inject(MockAuthApi);
  });

  it('should return available users without permissions', (done) => {
    api.getAvailableUsers().subscribe((users) => {
      expect(users.length).toBeGreaterThan(0);
      users.forEach((u) => {
        expect(u.username).toBeDefined();
        expect(u.displayName).toBeDefined();
        expect((u as any).permissions).toBeUndefined();
      });
      done();
    });
  });

  it('should return user with permissions on login', (done) => {
    api.login('admin').subscribe((user) => {
      expect(user).not.toBeNull();
      expect(user!.permissions.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should return null for unknown user', (done) => {
    api.login('unknown').subscribe((user) => {
      expect(user).toBeNull();
      done();
    });
  });
});
