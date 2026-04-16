import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DialogHostService } from './dialog-host.service';
import { ConfirmDialogContentComponent } from '../components/dialog-content/confirm-dialog-content.component';

export interface ConfirmDialogOptions {
  title: string;
  titleIcon?: string;
  message: string;
  details?: string[];
  confirmLabel?: string;
  cancelLabel?: string;
  confirmClass?: string;
}

export const DEFAULT_SAVE_DIALOG_CONFIG: ConfirmDialogOptions = {
  title: 'Confirm Save',
  titleIcon: 'bi bi-floppy',
  message: 'Are you sure you want to save this record?',
  confirmLabel: 'Save',
  confirmClass: 'btn-primary',
};

export const DEFAULT_DELETE_DIALOG_CONFIG: ConfirmDialogOptions = {
  title: 'Confirm Delete',
  titleIcon: 'bi bi-trash',
  message: 'Are you sure you want to delete this record? This action cannot be undone.',
  confirmLabel: 'Delete',
  cancelLabel: 'Cancel',
  confirmClass: 'btn-danger',
};

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly dialogHost = inject(DialogHostService);

  confirm(options: ConfirmDialogOptions): Observable<boolean> {
    if (!this.dialogHost.hasHost()) {
      return of(window.confirm(options.message));
    }

    return new Observable((subscriber) => {
      this.dialogHost.open(
        ConfirmDialogContentComponent,
        { title: options.title, titleIcon: options.titleIcon },
        (instance) => {
          instance.message = options.message;
          instance.details = options.details;
          instance.confirmLabel = options.confirmLabel ?? 'Confirm';
          instance.cancelLabel = options.cancelLabel ?? 'Cancel';
          instance.confirmClass = options.confirmClass ?? 'btn-primary';
          instance.resolve = (data: boolean) => this.dialogHost.handleResult(data);
        },
        (data: boolean | null) => {
          subscriber.next(data ?? false);
          subscriber.complete();
        },
      );
    });
  }
}
