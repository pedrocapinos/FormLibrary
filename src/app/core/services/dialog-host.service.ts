import { Injectable, ViewContainerRef, Type } from '@angular/core';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl';

export interface DialogConfig {
  title: string;
  titleIcon?: string;
  size?: DialogSize;
}

export interface DialogHostRef {
  show(config: DialogConfig): void;
  hide(options?: { restoreFocus?: boolean }): void;
  getOutlet(): ViewContainerRef;
}

@Injectable({ providedIn: 'root' })
export class DialogHostService {
  private host: DialogHostRef | null = null;
  private currentCallback: ((data: any) => void) | null = null;

  register(host: DialogHostRef): void {
    this.host = host;
  }

  unregister(host: DialogHostRef): void {
    if (this.host === host) {
      this.host = null;
    }
  }

  hasHost(): boolean {
    return this.host !== null;
  }

  open<C>(
    component: Type<C>,
    config: DialogConfig,
    setup?: (instance: C) => void,
    onResult?: (data: any) => void,
  ): void {
    if (!this.host) return;
    if (this.currentCallback) {
      const prev = this.currentCallback;
      this.currentCallback = null;
      prev(null);
    }
    const outlet = this.host.getOutlet();
    outlet.clear();
    const ref = outlet.createComponent(component);
    if (setup) setup(ref.instance);
    this.currentCallback = onResult ?? null;
    this.host.show(config);
  }

  handleResult(data: any, options?: { restoreFocus?: boolean }): void {
    this.currentCallback?.(data);
    this.currentCallback = null;
    this.host?.hide(options);
  }

  handleClose(): void {
    this.currentCallback?.(null);
    this.currentCallback = null;
  }
}
