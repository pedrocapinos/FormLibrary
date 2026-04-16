import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl, FormsModule, NgControl } from '@angular/forms';

@Component({
  selector: 'debug-message',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <small class="text-muted d-block mt-1"> Dirty: {{ control?.dirty | json }} </small>
    <small class="text-muted d-block mt-1"> Touched: {{ control?.touched | json }} </small>
    <small class="text-muted d-block mt-1"> Errors: {{ control?.errors | json }} </small>
    <small class="text-muted d-block mt-1"> Child value: {{ control?.value | json }} </small>
  `,
})
export class DebugMessage {
  @Input() control!: NgControl | AbstractControl | undefined;
}
