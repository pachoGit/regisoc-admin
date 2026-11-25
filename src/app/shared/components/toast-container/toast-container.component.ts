import { Component, inject } from '@angular/core';
import { ToastService, ToastType } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);

  protected toneClass(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'border-emerald-200 bg-white text-slate-900';
      case 'error':
        return 'border-rose-200 bg-white text-slate-900';
      case 'warning':
        return 'border-amber-200 bg-white text-slate-900';
      default:
        return 'border-sky-200 bg-white text-slate-900';
    }
  }

  protected accentClass(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'bg-emerald-500';
      case 'error':
        return 'bg-rose-500';
      case 'warning':
        return 'bg-amber-500';
      default:
        return 'bg-sky-500';
    }
  }
}
