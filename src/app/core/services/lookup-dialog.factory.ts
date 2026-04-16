import { Type } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { DialogHostService, DialogSize } from './dialog-host.service';

export interface LookupOptions {
  filters?: Record<string, string>;
  disable?: string[];
}

export interface LookupDialogConfig {
  component: Type<any>;
  title: string;
  titleIcon?: string;
  size?: DialogSize;
}

interface LookupListInstance {
  mode: string;
  resolve: (entity: any) => void;
  filterForm: FormGroup;
}

export function createLookupDialogOpener<TEntity>(config: LookupDialogConfig) {
  return (dialogHost: DialogHostService, options?: LookupOptions): Observable<TEntity | null> => {
    if (!dialogHost.hasHost()) {
      console.warn('DialogHostComponent not registered');
      return of(null);
    }

    return new Observable((subscriber) => {
      dialogHost.open<LookupListInstance>(
        config.component,
        { title: config.title, titleIcon: config.titleIcon ?? 'bi bi-search', size: config.size ?? 'lg' },
        (instance) => {
          instance.mode = 'selection';
          instance.resolve = (entity: TEntity) => dialogHost.handleResult(entity);
          if (options?.filters) {
            instance.filterForm.patchValue(options.filters);
          }
          if (options?.disable) {
            for (const key of options.disable) {
              instance.filterForm.get(key)?.disable();
            }
          }
        },
        (data: TEntity | null) => {
          subscriber.next(data);
          subscriber.complete();
        },
      );
    });
  };
}
