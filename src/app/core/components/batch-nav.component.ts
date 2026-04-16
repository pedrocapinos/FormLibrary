import { Component, inject } from '@angular/core';
import { BatchOperationsService } from '../services/batch-edit.service';

@Component({
  selector: 'batch-nav',
  standalone: true,
  template: `
    @if (batch.isBatching) {
      <span class="batch-indicator">
        <span class="batch-indicator__pos">
          {{ batch.currentIndex + 1 }}
          <span class="batch-indicator__sep">/</span>
          {{ batch.totalCount }}
        </span>
        <span class="batch-indicator__nav">
          <button
            type="button"
            class="batch-indicator__btn"
            [disabled]="!batch.hasPrev()"
            (click)="batch.goPrev()"
            aria-label="Previous record"
          >
            <i class="bi bi-chevron-left" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            class="batch-indicator__btn"
            [disabled]="!batch.hasNext()"
            (click)="batch.goNext()"
            aria-label="Next record"
          >
            <i class="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
        </span>
      </span>
    }
  `,
})
export class BatchNavComponent {
  readonly batch = inject(BatchOperationsService);
}
