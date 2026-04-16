import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[selectAllOnFocus]',
  standalone: true,
})
export class SelectAllOnFocusDirective {
  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('focus')
  onFocus(): void {
    this.el.nativeElement.select();
  }
}
