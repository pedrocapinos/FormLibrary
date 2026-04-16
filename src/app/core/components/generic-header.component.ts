import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'generic-header',
  standalone: true,
  styles: [
    `
      :host {
        display: block;
        margin-bottom: 1.5rem;
      }

      .head {
        display: flex;
        flex-wrap: wrap;
        align-items: end;
        gap: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border-strong);
      }
      .back { flex: 0 0 auto; }
      .titles { flex: 1 1 280px; min-width: 0; }
      .actions { flex: 1 1 auto; }

      .back {
        all: unset;
        cursor: pointer;
        width: 34px;
        height: 34px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border);
        border-radius: 3px;
        color: var(--ink-700);
        font-family: var(--font-mono);
        transition: all 120ms ease;
        align-self: center;
      }

      .back:hover,
      .back:focus-visible {
        border-color: var(--accent);
        color: var(--accent);
        outline: none;
      }

      .titles {
        min-width: 0;
      }

      .crumb {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--ink-500);
        margin-bottom: 0.35rem;
      }

      .crumb::before {
        content: '';
        width: 1.25rem;
        height: 1px;
        background: var(--accent);
      }

      h1.title {
        font-family: var(--font-display);
        font-weight: 600;
        font-size: 1.625rem;
        letter-spacing: -0.015em;
        line-height: 1.1;
        color: var(--ink-900);
        margin: 0;
      }

      .subtitle {
        display: block;
        color: var(--ink-500);
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      .actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      @media (max-width: 720px) {
        .head { align-items: start; }
        .actions { justify-content: flex-start; }
      }
    `,
  ],
  template: `
    <div class="head">
      @if (showBackButton) {
        <button type="button" class="back" (click)="backClick.emit()" aria-label="Back">
          &larr;
        </button>
      }
      <div class="titles">
        <div class="crumb">{{ eyebrow || 'View' }}</div>
        <h1 class="title">{{ title }}</h1>
        @if (subtitle) {
          <small class="subtitle">{{ subtitle }}</small>
        }
      </div>
      <div class="actions">
        <ng-content />
      </div>
    </div>
  `,
})
export class GenericHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
  @Input() eyebrow?: string;
  @Input() showBackButton = false;
  @Output() backClick = new EventEmitter<void>();
}
