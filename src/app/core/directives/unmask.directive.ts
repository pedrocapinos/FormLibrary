import { Directive, Input, OnInit, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';
import { MaskitoDirective } from '@maskito/angular';
import { maskitoTransform } from '@maskito/core';
import { identity } from 'rxjs';

@Directive({
  selector: '[maskito][unmaskHandler]',
  standalone: true,
})
export class UnmaskDirective implements OnInit {
  @Input() unmaskHandler: (value: string) => any = identity;

  @Input() maskHandler: (value: any) => string = (value) =>
    this.maskitoDirective.options
      ? maskitoTransform(String(value), this.maskitoDirective.options)
      : value;

  constructor(
    @Optional() @Self() private readonly ngControl: NgControl,
    @Optional() private readonly maskitoDirective: MaskitoDirective
  ) {}

  ngOnInit() {
    if (!this.ngControl || !this.ngControl.valueAccessor) {
      console.warn('UnmaskDirective: NgControl or valueAccessor not found');
      return;
    }

    const valueAccessor = this.ngControl.valueAccessor;

    // Get original methods
    const originalRegisterOnChange = valueAccessor.registerOnChange;
    const originalWriteValue = valueAccessor.writeValue;

    // Override registerOnChange to intercept the onChange function (for user input)
    valueAccessor.registerOnChange = (fn: any) => {
      // Create a wrapper function that applies unmasking before calling the original function
      const wrappedFn = (value: string) => {
        const unmaskedValue = this.unmaskHandler(value);
        fn(unmaskedValue);
      };

      // Register our wrapped function with the original registerOnChange
      originalRegisterOnChange.call(valueAccessor, wrappedFn);
    };

    // Override writeValue to handle programmatic updates (mask the value for display)
    valueAccessor.writeValue = (value: any) => {
      if (value != null && value !== '') {
        const maskedValue = this.maskHandler(value);
        originalWriteValue.call(valueAccessor, maskedValue);
      } else {
        originalWriteValue.call(valueAccessor, value);
      }
    };
  }
}
