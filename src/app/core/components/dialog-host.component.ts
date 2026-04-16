import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { DialogConfig, DialogHostRef, DialogHostService } from '../services/dialog-host.service';

@Component({
  selector: 'dialog-host',
  standalone: true,
  template: `
    <dialog
      #dialog
      [class]="dialogClass"
      [attr.aria-labelledby]="titleId"
      (click)="onBackdropClick($event)"
      (close)="onNativeClose()"
    >
      <div class="dialog-content" role="document" (click)="$event.stopPropagation()">
        <div class="dialog-head">
          @if (titleIcon) {
            <i [class]="titleIcon" aria-hidden="true"></i>
          }
          <h2 [id]="titleId" class="dialog-head__title">{{ title }}</h2>
          <button
            type="button"
            class="dialog-head__close"
            aria-label="Close"
            (click)="close()"
          >×</button>
        </div>
        <div class="dialog-body">
          <ng-container #outlet />
        </div>
      </div>
    </dialog>
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      dialog {
        border: 1px solid var(--border-strong);
        border-radius: var(--radius);
        padding: 0;
        min-width: 320px;
        max-width: 520px;
        background: var(--paper);
        color: var(--ink-900);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
      }

      dialog::backdrop {
        background-color: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(2px);
      }

      .dialog-content {
        padding: 0;
      }

      .dialog-head {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--border);
        background: var(--ink-50);
      }

      .dialog-head__title {
        margin: 0;
        font-family: var(--font-display);
        font-weight: 600;
        font-size: 0.95rem;
        letter-spacing: -0.005em;
        color: var(--ink-900);
      }

      .dialog-head__close {
        margin-left: auto;
        background: none;
        border: 1px solid var(--border);
        border-radius: 2px;
        width: 26px;
        height: 26px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--ink-600);
        font-family: var(--font-mono);
        line-height: 1;
        transition: all 120ms ease;
      }
      .dialog-head__close:hover,
      .dialog-head__close:focus-visible {
        border-color: var(--danger);
        color: var(--danger);
        outline: none;
      }

      .dialog-body {
        padding: 1rem 1.25rem 1.25rem;
      }

      dialog.dialog-sm {
        max-width: 400px;
      }

      dialog.dialog-lg {
        width: 70vw;
        max-width: 70vw;
        height: 85vh;
      }

      dialog.dialog-xl {
        width: 90vw;
        max-width: 90vw;
        height: 95vh;
      }
    `,
  ],
})
export class DialogHostComponent implements OnInit, AfterViewInit, OnDestroy, DialogHostRef {
  @ViewChild('dialog') dialogRef!: ElementRef<HTMLDialogElement>;
  @ViewChild('outlet', { read: ViewContainerRef }) outlet!: ViewContainerRef;

  private readonly dialogHostService = inject(DialogHostService);
  private readonly zone = inject(NgZone);
  private triggerElement: HTMLElement | null = null;
  private shouldRestoreFocus = true;
  private readonly messageHandler = (event: MessageEvent) => this.onMessage(event);

  readonly titleId = 'dialog-host-title';
  title = '';
  titleIcon = '';
  dialogClass = '';

  ngOnInit(): void {
    window.addEventListener('message', this.messageHandler);
  }

  ngAfterViewInit(): void {
    this.dialogHostService.register(this);
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.messageHandler);
    this.dialogHostService.unregister(this);
  }

  show(config: DialogConfig): void {
    this.title = config.title;
    this.titleIcon = config.titleIcon ?? '';
    this.dialogClass = config.size && config.size !== 'md' ? `dialog-${config.size}` : '';
    this.shouldRestoreFocus = true;
    const dialogEl = this.dialogRef.nativeElement;
    if (!dialogEl.open) {
      this.triggerElement = document.activeElement as HTMLElement | null;
      dialogEl.showModal();
    }
  }

  hide(options?: { restoreFocus?: boolean }): void {
    this.shouldRestoreFocus = options?.restoreFocus ?? true;
    this.dialogRef.nativeElement.close();
  }

  getOutlet(): ViewContainerRef {
    return this.outlet;
  }

  close(): void {
    this.dialogRef.nativeElement.close();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialogRef.nativeElement) {
      this.close();
    }
  }

  onNativeClose(): void {
    if (this.shouldRestoreFocus) {
      this.triggerElement?.focus();
    }
    this.triggerElement = null;
    this.outlet.clear();
    this.dialogHostService.handleClose();
  }

  private onMessage(event: MessageEvent): void {
    if (event.origin !== location.origin) return;
    const msg = event.data;
    if (!msg || msg.type !== 'dialog-result') return;

    this.zone.run(() => {
      this.dialogHostService.handleResult(msg.data, msg.options);
    });
  }
}
