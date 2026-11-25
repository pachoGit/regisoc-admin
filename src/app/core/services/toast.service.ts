import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private readonly toastsSignal = signal<ToastMessage[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  show(type: ToastType, title: string, message?: string, durationMs = 4500): number {
    const id = this.nextId++;
    const toast: ToastMessage = { id, type, title, message };
    this.toastsSignal.update((list) => [...list, toast]);

    if (durationMs > 0) {
      setTimeout(() => this.dismiss(id), durationMs);
    }

    return id;
  }

  success(title: string, message?: string): number {
    return this.show('success', title, message);
  }

  error(title: string, message?: string): number {
    return this.show('error', title, message, 6000);
  }

  info(title: string, message?: string): number {
    return this.show('info', title, message);
  }

  warning(title: string, message?: string): number {
    return this.show('warning', title, message);
  }

  dismiss(id: number): void {
    this.toastsSignal.update((list) => list.filter((t) => t.id !== id));
  }
}
