import { ElementRef } from '@angular/core';

/**
 * Focuses the first input/select carrying `is-invalid`. Wrapped in `setTimeout`
 * to wait one Angular CD tick so the class lands on the DOM before we query.
 * Group-level validators must propagate `groupInvalid` to the leaves they want
 * picked as the focus target.
 */
export function focusFirstInvalidControl(hostEl: ElementRef<HTMLElement>): void {
  setTimeout(() => {
    const input = hostEl.nativeElement.querySelector<HTMLElement>(
      'input.is-invalid:not([disabled]), input.ng-invalid:not([disabled]), select.is-invalid:not([disabled]), select.ng-invalid:not([disabled])',
    );
    if (!input) return;

    const doFocus = () => {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      input.focus();
    };

    const tabPanel = input.closest('[role="tabpanel"]') as HTMLElement | null;
    if (tabPanel?.classList.contains('d-none') && tabPanel.id) {
      document.querySelector<HTMLElement>(`[aria-controls="${tabPanel.id}"]`)?.click();
      setTimeout(doFocus);
      return;
    }

    doFocus();
  });
}

/**
 * Focuses the form control with the given name.
 * Wrapped in setTimeout to allow <dialog>.close() to finish restoring focus first.
 */
export function focusControlByKey(key: string, hostEl: ElementRef<HTMLElement>): void {
  setTimeout(() => {
    // For nested paths like "address.state", also try the leaf segment ("state")
    const lastSegment = key.includes('.') ? key.split('.').pop()! : key;
    const isNested = lastSegment !== key;

    const el =
      document.getElementById(key) ??
      document.getElementById(key + '-input') ??
      (isNested ? document.getElementById(lastSegment) : null) ??
      (isNested ? document.getElementById(lastSegment + '-input') : null) ??
      hostEl.nativeElement.querySelector<HTMLElement>(`[formControlName="${key}"]`) ??
      (isNested ? hostEl.nativeElement.querySelector<HTMLElement>(`[formControlName="${lastSegment}"]`) : null);

    if (el) {
      const focusable =
        el instanceof HTMLInputElement || el instanceof HTMLSelectElement
          ? el
          : el.querySelector<HTMLElement>('input, select');
      focusable?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      focusable?.focus();
    }
  });
}
