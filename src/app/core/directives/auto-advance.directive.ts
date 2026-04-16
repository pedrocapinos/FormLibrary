import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[autoAdvance]',
  standalone: true,
})
export class AutoAdvanceDirective {
  @Input() autoAdvance!: (el: HTMLInputElement) => boolean;

  private wasReady = false;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (event.key.length > 1 && event.key !== 'Backspace' && event.key !== 'Delete') {
      return;
    }

    const el = this.el.nativeElement;
    const isFull = this.autoAdvance(el);
    const isReady = isFull && el.selectionStart === el.value.length;

    if (isReady && !this.wasReady) {
      this.focusNextInput(el);
    }
    this.wasReady = isReady;
  }

  @HostListener('focus')
  onFocus(): void {
    this.wasReady = false;
  }

  private focusNextInput(current: HTMLInputElement): void {
    const form = current.closest('form');
    if (!form) return;

    const inputs = Array.from(form.querySelectorAll('input, select, textarea')) as HTMLElement[];

    const currentIndex = inputs.indexOf(current);
    for (let i = currentIndex + 1; i < inputs.length; i++) {
      if (inputs[i].offsetParent !== null && !(inputs[i] as HTMLInputElement).disabled) {
        inputs[i].focus();
        return;
      }
    }
  }
}
