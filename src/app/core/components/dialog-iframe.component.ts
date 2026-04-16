import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface DialogIframeMessage {
  type: string;
  [key: string]: unknown;
}

@Component({
  selector: 'dialog-iframe',
  standalone: true,
  template: `
    <iframe
      #iframe
      [src]="safeSrc"
      [style.width]="width"
      [style.height]="height"
      sandbox="allow-scripts allow-same-origin allow-forms"
      [title]="iframeTitle"
    ></iframe>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      iframe {
        border: none;
        display: block;
      }
    `,
  ],
})
export class DialogIframeComponent implements OnInit, OnDestroy {
  @ViewChild('iframe') iframeRef!: ElementRef<HTMLIFrameElement>;

  @Input({ required: true }) src!: string;
  @Input({ required: true }) origin!: string;
  @Input() token?: string;
  @Input() width = '100%';
  @Input() height = '500px';
  @Input() iframeTitle = 'External content';

  @Output() result = new EventEmitter<unknown>();
  @Output() ready = new EventEmitter<void>();

  safeSrc!: SafeResourceUrl;

  private readonly sanitizer = inject(DomSanitizer);
  private readonly zone = inject(NgZone);
  private readonly messageHandler = (event: MessageEvent) => this.onMessage(event);

  ngOnInit(): void {
    this.safeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(this.src);
    window.addEventListener('message', this.messageHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.messageHandler);
  }

  private onMessage(event: MessageEvent): void {
    if (event.origin !== this.origin) return;

    const data = event.data as DialogIframeMessage;
    if (!data || typeof data.type !== 'string') return;

    this.zone.run(() => {
      switch (data.type) {
        case 'ready':
          this.ready.emit();
          if (this.token) {
            this.iframeRef.nativeElement.contentWindow?.postMessage(
              { type: 'token', token: this.token },
              this.origin
            );
          }
          break;

        case 'result':
          this.result.emit(data['data']);
          break;
      }
    });
  }
}
