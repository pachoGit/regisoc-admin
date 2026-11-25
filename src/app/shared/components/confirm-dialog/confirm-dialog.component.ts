import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  protected readonly confirmService = inject(ConfirmDialogService);

  protected confirmButtonClass(variant?: 'primary' | 'danger' | 'warning'): string {
    switch (variant) {
      case 'danger':
        return 'rs-btn rs-btn-danger';
      case 'warning':
        return 'rs-btn rs-btn-warning';
      default:
        return 'rs-btn rs-btn-primary';
    }
  }
}
