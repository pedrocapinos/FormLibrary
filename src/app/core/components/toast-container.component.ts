import { Component, inject } from '@angular/core';
import { ToastService } from '../services/toast.service';
import type { Toast, ToastType } from '../types/toast';

const ICON_MAP: Record<ToastType, string> = {
  success: 'bi-check-circle',
  error: 'bi-x-octagon',
  warning: 'bi-exclamation-triangle',
  info: 'bi-info-circle',
};

const LABEL_MAP: Record<ToastType, string> = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
};

@Component({
  selector: 'toast-container',
  standalone: true,
  styles: [
    `
      :host {
        position: fixed;
        right: 1rem;
        bottom: 1rem;
        z-index: 1080;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.5rem;
        pointer-events: none;
      }

      .toast {
        pointer-events: auto;
        min-width: 300px;
        max-width: 420px;
        background: var(--paper);
        border: 1px solid var(--border-strong);
        border-left: 3px solid var(--toast-accent);
        box-shadow: 0 6px 20px rgba(10, 10, 10, 0.12);
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: start;
        gap: 0.65rem;
        padding: 0.7rem 0.85rem;
        animation: toast-in 180ms cubic-bezier(0.22, 1, 0.36, 1);
      }

      .toast--success { --toast-accent: var(--success); }
      .toast--error   { --toast-accent: var(--danger); }
      .toast--warning { --toast-accent: var(--warn); }
      .toast--info    { --toast-accent: var(--accent); }

      .toast__icon {
        color: var(--toast-accent);
        font-size: 1rem;
        line-height: 1.25;
        margin-top: 1px;
      }

      .toast__body {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }

      .toast__label {
        font-family: var(--font-mono);
        font-size: 0.625rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--toast-accent);
        font-weight: 500;
      }

      .toast__msg {
        font-family: var(--font-display);
        font-size: 0.875rem;
        color: var(--ink-900);
        line-height: 1.4;
        word-wrap: break-word;
      }

      .toast__close {
        all: unset;
        cursor: pointer;
        width: 22px;
        height: 22px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border);
        border-radius: 2px;
        color: var(--ink-500);
        font-family: var(--font-mono);
        font-size: 0.95rem;
        line-height: 1;
        transition: all 120ms ease;
      }
      .toast__close:hover,
      .toast__close:focus-visible {
        border-color: var(--danger);
        color: var(--danger);
        outline: none;
      }

      @keyframes toast-in {
        from {
          opacity: 0;
          transform: translateX(8px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `,
  ],
  template: `
    @for (toast of toastService.toasts(); track toast.id) {
      <div
        class="toast"
        [class]="'toast toast--' + toast.type"
        role="alert"
        [attr.aria-live]="
          toast.type === 'error' || toast.type === 'warning' ? 'assertive' : 'polite'
        "
        aria-atomic="true"
      >
        <i class="toast__icon bi" [class]="'toast__icon bi ' + iconClass(toast)" aria-hidden="true"></i>
        <div class="toast__body">
          <span class="toast__label">{{ labelFor(toast) }}</span>
          <span class="toast__msg">{{ toast.message }}</span>
        </div>
        @if (toast.dismissible) {
          <button
            type="button"
            class="toast__close"
            aria-label="Close"
            (click)="toastService.dismiss(toast.id)"
          >×</button>
        }
      </div>
    }
  `,
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);

  iconClass(toast: Toast): string {
    return ICON_MAP[toast.type] ?? ICON_MAP.info;
  }

  labelFor(toast: Toast): string {
    return LABEL_MAP[toast.type] ?? LABEL_MAP.info;
  }
}
