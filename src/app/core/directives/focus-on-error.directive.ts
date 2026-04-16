import { Directive, ElementRef, HostListener, OnDestroy, inject } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';
import { focusFirstInvalidControl } from '../utils/focus-utils';

@Directive({
  selector: 'form[formGroup][appFocusOnError]',
  standalone: true,
})
export class FocusOnErrorDirective implements OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly formDir = inject(FormGroupDirective);
  private submitTimer?: ReturnType<typeof setTimeout>;

  @HostListener('submit')
  onFormSubmit(): void {
    clearTimeout(this.submitTimer);
    this.submitTimer = setTimeout(() => {
      const form = this.formDir.control;
      if (form.invalid) {
        form.markAllAsTouched();
        focusFirstInvalidControl(this.el);
      }
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.submitTimer);
  }
}
