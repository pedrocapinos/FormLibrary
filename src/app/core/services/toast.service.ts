import { Injectable, signal } from '@angular/core';
import { Toast, ToastConfig, ToastType } from '../types/toast';

const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 4000,
  info: 4000,
  warning: 6000,
  error: 0,
};

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  readonly toasts = this._toasts.asReadonly();

  success(message: string): void {
    this.show({ message, type: 'success' });
  }
  error(message: string): void {
    this.show({ message, type: 'error' });
  }
  warning(message: string): void {
    this.show({ message, type: 'warning' });
  }
  info(message: string): void {
    this.show({ message, type: 'info' });
  }

  show(config: ToastConfig): void {
    const toast: Toast = {
      ...config,
      id: Math.random().toString(36).slice(2),
      dismissible: config.dismissible ?? true,
    };

    this._toasts.update((list) => [...list, toast]);

    const duration = config.duration ?? DEFAULT_DURATIONS[config.type];
    if (duration > 0) {
      const timer = setTimeout(() => this.dismiss(toast.id), duration);
      this.timers.set(toast.id, timer);
    }
  }

  dismiss(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
