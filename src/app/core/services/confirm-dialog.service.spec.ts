import { TestBed } from '@angular/core/testing';
import { ConfirmDialogService, ConfirmDialogOptions } from './confirm-dialog.service';
import { DialogHostService } from './dialog-host.service';
import { ConfirmDialogContentComponent } from '../components/dialog-content/confirm-dialog-content.component';

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;
  let dialogHost: DialogHostService;

  const defaultOptions: ConfirmDialogOptions = {
    title: 'Test',
    message: 'Are you sure?',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfirmDialogService);
    dialogHost = TestBed.inject(DialogHostService);
  });

  describe('confirm()', () => {
    it('falls back to window.confirm when no host is registered', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      let result: boolean | undefined;
      service.confirm(defaultOptions).subscribe((v) => (result = v));

      expect(window.confirm).toHaveBeenCalledWith('Are you sure?');
      expect(result).toBeFalse();
    });

    it('opens via DialogHostService when host is available', () => {
      spyOn(dialogHost, 'hasHost').and.returnValue(true);
      spyOn(dialogHost, 'open');

      service.confirm(defaultOptions).subscribe();

      expect(dialogHost.open).toHaveBeenCalled();
      const [component, config] = (dialogHost.open as jasmine.Spy).calls.mostRecent().args;
      expect(component).toBe(ConfirmDialogContentComponent);
      expect(config.title).toBe('Test');
    });

    it('passes options to the content component via setup callback', () => {
      const options: ConfirmDialogOptions = {
        title: 'Delete',
        titleIcon: 'bi bi-trash',
        message: 'Delete this?',
        confirmLabel: 'Delete',
        cancelLabel: 'Keep',
        confirmClass: 'btn-danger',
      };

      spyOn(dialogHost, 'hasHost').and.returnValue(true);
      spyOn(dialogHost, 'open');

      service.confirm(options).subscribe();

      const [, config, setup] = (dialogHost.open as jasmine.Spy).calls.mostRecent().args;
      expect(config.title).toBe('Delete');
      expect(config.titleIcon).toBe('bi bi-trash');

      // Simulate the setup callback
      const mockInstance = {
        message: '',
        details: undefined as string[] | undefined,
        confirmLabel: '',
        cancelLabel: '',
        confirmClass: '',
        resolve: () => {},
      };
      setup(mockInstance);

      expect(mockInstance.message).toBe('Delete this?');
      expect(mockInstance.confirmLabel).toBe('Delete');
      expect(mockInstance.cancelLabel).toBe('Keep');
      expect(mockInstance.confirmClass).toBe('btn-danger');
    });

    it('emits the result from the onResult callback', () => {
      spyOn(dialogHost, 'hasHost').and.returnValue(true);
      spyOn(dialogHost, 'open').and.callFake((_comp: any, _config: any, _setup: any, onResult?: (data: any) => void) => {
        onResult?.(true);
      });

      let result: boolean | undefined;
      service.confirm(defaultOptions).subscribe((v) => (result = v));

      expect(result).toBeTrue();
    });

    it('emits false and completes when dialog is dismissed (null callback)', () => {
      spyOn(dialogHost, 'hasHost').and.returnValue(true);
      spyOn(dialogHost, 'open').and.callFake((_comp: any, _config: any, _setup: any, onResult?: (data: any) => void) => {
        onResult?.(null);
      });

      let result: boolean | undefined;
      let completed = false;
      service.confirm(defaultOptions).subscribe({
        next: (v) => (result = v),
        complete: () => (completed = true),
      });

      expect(result).toBeFalse();
      expect(completed).toBeTrue();
    });

    it('uses default labels when not specified', () => {
      spyOn(dialogHost, 'hasHost').and.returnValue(true);
      spyOn(dialogHost, 'open');

      service.confirm(defaultOptions).subscribe();

      const [, , setup] = (dialogHost.open as jasmine.Spy).calls.mostRecent().args;
      const mockInstance = { message: '', confirmLabel: '', cancelLabel: '', confirmClass: '', resolve: () => {} };
      setup(mockInstance);

      expect(mockInstance.confirmLabel).toBe('Confirm');
      expect(mockInstance.cancelLabel).toBe('Cancel');
      expect(mockInstance.confirmClass).toBe('btn-primary');
    });
  });
});
