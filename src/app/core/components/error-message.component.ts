import { Component, Input } from '@angular/core';
import { AbstractControl, AbstractControlDirective } from '@angular/forms';
import { ErrorMessageConfig, ErrorMessageService } from '../services/error-message.service';

@Component({
  selector: 'error-message',
  standalone: true,
  template: `
    @if (isPending) {
      <small [id]="id" class="text-muted d-block" aria-live="polite">
        <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        Validating...
      </small>
    } @else if (shouldShow) {
      <small [id]="id" class="invalid-feedback d-block" role="alert" aria-live="polite">
        {{ message }}
      </small>
    }
  `,
})
export class ErrorMessageComponent {
  @Input() id?: string;
  @Input() control: AbstractControl | AbstractControlDirective | null = null;
  @Input() label = 'Field';
  @Input() customMessages?: Partial<ErrorMessageConfig>;

  constructor(private errorMessageService: ErrorMessageService) {}

  get isPending(): boolean {
    return !!(this.control?.pending && (this.control.dirty || this.control.touched));
  }

  get shouldShow(): boolean {
    return !!(this.control?.errors && (this.control.dirty || this.control.touched));
  }

  get message(): string {
    const errors = this.control?.errors;
    if (!errors) return '';
    return this.errorMessageService.resolve(errors, this.label, this.customMessages);
  }
}
