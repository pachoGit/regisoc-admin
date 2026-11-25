import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger' | 'warning';
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly pendingSignal = signal<PendingConfirm | null>(null);
  readonly pending = this.pendingSignal.asReadonly();

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.pendingSignal.set({
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        variant: 'primary',
        ...options,
        resolve,
      });
    });
  }

  accept(): void {
    const current = this.pendingSignal();
    if (current) {
      this.pendingSignal.set(null);
      current.resolve(true);
    }
  }

  cancel(): void {
    const current = this.pendingSignal();
    if (current) {
      this.pendingSignal.set(null);
      current.resolve(false);
    }
  }
}
