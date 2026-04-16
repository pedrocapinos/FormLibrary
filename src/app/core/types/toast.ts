export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  message: string;
  type: ToastType;
  duration?: number;
  dismissible?: boolean;
}

export interface Toast extends ToastConfig {
  id: string;
}
