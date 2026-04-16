import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { authGuard, permissionGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  let auth: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: {
            createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue('/login' as any),
          },
        },
      ],
    });
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  function runGuard(url = '/employees'): boolean | UrlTree {
    const state = { url } as any;
    return TestBed.runInInjectionContext(() => authGuard({} as ActivatedRouteSnapshot, state)) as
      | boolean
      | UrlTree;
  }

  it('should redirect to /login with returnUrl when not authenticated', () => {
    const result = runGuard('/classes/5');
    expect(result).toBe('/login' as any);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/classes/5' },
    });
  });

  it('should allow access when authenticated', (done) => {
    auth.login('admin').subscribe(() => {
      const result = runGuard();
      expect(result).toBe(true);
      done();
    });
  });
});

describe('permissionGuard', () => {
  let auth: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: {
            createUrlTree: jasmine
              .createSpy('createUrlTree')
              .and.returnValue('/unauthorized' as any),
          },
        },
      ],
    });
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  function runGuard(data: Record<string, string>): boolean | UrlTree {
    const route = { data } as unknown as ActivatedRouteSnapshot;
    return TestBed.runInInjectionContext(() => permissionGuard(route, {} as any)) as
      | boolean
      | UrlTree;
  }

  it('should allow access when no route data is specified', (done) => {
    auth.login('viewer').subscribe(() => {
      const result = runGuard({});
      expect(result).toBe(true);
      done();
    });
  });

  it('should allow access when user has the required permission', (done) => {
    auth.login('admin').subscribe(() => {
      const result = runGuard({ recordType: 'employee', action: 'edit' });
      expect(result).toBe(true);
      done();
    });
  });

  it('should redirect to /unauthorized when user lacks permission', (done) => {
    auth.login('viewer').subscribe(() => {
      const result = runGuard({ recordType: 'employee', action: 'edit' });
      expect(result).toBe('/unauthorized' as any);
      expect(router.createUrlTree).toHaveBeenCalledWith(['/unauthorized']);
      done();
    });
  });

  it('should respect record-type-specific permissions (employee-manager)', (done) => {
    auth.login('employee-manager').subscribe(() => {
      expect(runGuard({ recordType: 'employee', action: 'edit' })).toBe(true);
      expect(runGuard({ recordType: 'employee', action: 'read' })).toBe(true);
      expect(runGuard({ recordType: 'employee', action: 'delete' })).toBe(true);
      done();
    });
  });
});
