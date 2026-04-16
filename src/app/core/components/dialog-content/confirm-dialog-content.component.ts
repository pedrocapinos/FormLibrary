import { Component, Input } from '@angular/core';

@Component({
  selector: 'confirm-dialog-content',
  standalone: true,
  template: `
    <p class="mb-0">{{ message }}</p>
    @if (details && details.length) {
      <ul class="mt-2 mb-0 text-muted small" style="max-height: 200px; overflow-y: auto;">
        @for (detail of details; track $index) {
          <li>{{ detail }}</li>
        }
      </ul>
    }
    <div class="d-flex justify-content-end gap-2 mt-3">
      <button type="button" class="btn btn-secondary" (click)="onCancel()">
        {{ cancelLabel }}
      </button>
      <button type="button" [class]="'btn ' + confirmClass" (click)="onConfirm()">
        {{ confirmLabel }}
      </button>
    </div>
  `,
})
export class ConfirmDialogContentComponent {
  @Input() message = '';
  @Input() details?: string[];
  @Input() confirmLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';
  @Input() confirmClass = 'btn-primary';
  @Input() resolve: (data: boolean) => void = () => {};

  onConfirm(): void {
    this.resolve(true);
  }

  onCancel(): void {
    this.resolve(false);
  }
}
