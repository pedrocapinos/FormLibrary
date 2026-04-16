import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { ConfirmDialogService } from '../services/confirm-dialog.service';

export interface HasUnsavedChanges {
  form: FormGroup;
  saving: boolean;
  deleting: boolean;
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (component.saving || component.deleting) {
    return true;
  }

  if (component.hasUnsavedChanges()) {
    const confirmService = inject(ConfirmDialogService);
    return confirmService.confirm({
      title: 'Unsaved Changes',
      titleIcon: 'bi bi-exclamation-triangle',
      message: 'You have unsaved changes. Do you want to leave this page?',
      confirmLabel: 'Leave',
      cancelLabel: 'Stay',
      confirmClass: 'btn-warning',
    });
  }

  return true;
};
