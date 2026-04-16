import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { unsavedChangesGuard, HasUnsavedChanges } from './unsaved-changes.guard';
import { ConfirmDialogService } from '../services/confirm-dialog.service';

describe('unsavedChangesGuard', () => {
  let confirmService: jasmine.SpyObj<ConfirmDialogService>;

  function createComponent(overrides: Partial<HasUnsavedChanges> = {}): HasUnsavedChanges {
    return {
      form: new FormGroup({ name: new FormControl('') }),
      saving: false,
      deleting: false,
      hasUnsavedChanges: () => false,
      ...overrides,
    };
  }

  function runGuard(component: HasUnsavedChanges): boolean | Observable<boolean> {
    return TestBed.runInInjectionContext(() =>
      unsavedChangesGuard(component, {} as any, {} as any, {} as any)
    ) as boolean | Observable<boolean>;
  }

  beforeEach(() => {
    confirmService = jasmine.createSpyObj('ConfirmDialogService', ['confirm']);

    TestBed.configureTestingModule({
      providers: [{ provide: ConfirmDialogService, useValue: confirmService }],
    });
  });

  it('should allow navigation when there are no unsaved changes', () => {
    const component = createComponent();
    expect(runGuard(component)).toBe(true);
  });

  it('should show confirm dialog when there are unsaved changes', () => {
    const component = createComponent({ hasUnsavedChanges: () => true });
    confirmService.confirm.and.returnValue(of(false));

    let result: boolean | undefined;
    const guard = runGuard(component);
    (guard as Observable<boolean>).subscribe((v) => (result = v));

    expect(confirmService.confirm).toHaveBeenCalled();
    expect(result).toBeFalse();
  });

  it('should allow navigation when user confirms', () => {
    const component = createComponent({ hasUnsavedChanges: () => true });
    confirmService.confirm.and.returnValue(of(true));

    let result: boolean | undefined;
    const guard = runGuard(component);
    (guard as Observable<boolean>).subscribe((v) => (result = v));

    expect(result).toBeTrue();
  });

  it('should pass correct options to the confirm service', () => {
    const component = createComponent({ hasUnsavedChanges: () => true });
    confirmService.confirm.and.returnValue(of(true));

    runGuard(component);

    expect(confirmService.confirm).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: 'Unsaved Changes',
        confirmLabel: 'Leave',
        cancelLabel: 'Stay',
        confirmClass: 'btn-warning',
      })
    );
  });

  it('should skip prompt when saving', () => {
    const component = createComponent({ saving: true, hasUnsavedChanges: () => true });

    expect(runGuard(component)).toBe(true);
    expect(confirmService.confirm).not.toHaveBeenCalled();
  });

  it('should skip prompt when deleting', () => {
    const component = createComponent({ deleting: true, hasUnsavedChanges: () => true });

    expect(runGuard(component)).toBe(true);
    expect(confirmService.confirm).not.toHaveBeenCalled();
  });
});
