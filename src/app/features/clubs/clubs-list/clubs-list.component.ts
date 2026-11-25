import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClubApi } from '../../../core/api/club.api';
import { AuthService } from '../../../core/auth/auth.service';
import { Club } from '../../../core/models/club.model';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../core/services/toast.service';
import { parseApiError } from '../../../core/utils/api-error.parser';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-clubs-list',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ModalComponent,
  ],
  templateUrl: './clubs-list.component.html',
  styleUrl: './clubs-list.component.scss',
})
export class ClubsListComponent implements OnInit {
  private readonly clubApi = inject(ClubApi);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly fb = inject(FormBuilder);

  protected readonly clubs = signal<Club[]>([]);
  protected readonly loading = signal(true);
  protected readonly searchTerm = signal('');

  protected readonly modalOpen = signal(false);
  protected readonly editingClub = signal<Club | null>(null);
  protected readonly saving = signal(false);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    foundedYear: [null as number | null, [Validators.min(1850), Validators.max(2100)]],
    crestUrl: [''],
    description: [''],
  });

  ngOnInit(): void {
    this.loadClubs();
  }

  protected loadClubs(): void {
    this.loading.set(true);
    this.clubApi.getAll(this.searchTerm()).subscribe({
      next: (clubs) => {
        this.clubs.set(clubs);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        const parsed = parseApiError(err);
        this.toastService.error(parsed.title, parsed.message);
      },
    });
  }

  protected onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  protected openCreateModal(): void {
    this.editingClub.set(null);
    this.form.reset({
      name: '',
      foundedYear: null,
      crestUrl: '',
      description: '',
    });
    this.modalOpen.set(true);
  }

  protected openEditModal(club: Club): void {
    this.editingClub.set(club);
    this.form.reset({
      name: club.name,
      foundedYear: club.foundedYear,
      crestUrl: club.crestUrl ?? '',
      description: club.description ?? '',
    });
    this.modalOpen.set(true);
  }

  protected closeModal(): void {
    this.modalOpen.set(false);
  }

  protected saveClub(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload = {
      name: (raw.name ?? '').trim(),
      foundedYear: raw.foundedYear ? Number(raw.foundedYear) : null,
      crestUrl: raw.crestUrl?.trim() || null,
      description: raw.description?.trim() || null,
    };

    this.saving.set(true);
    const current = this.editingClub();

    if (current) {
      this.clubApi.update(current.id, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.modalOpen.set(false);
          this.toastService.success('Club actualizado', `"${payload.name}" fue actualizado.`);
          this.loadClubs();
        },
        error: (err) => {
          this.saving.set(false);
          const parsed = parseApiError(err);
          this.toastService.error(parsed.title, parsed.message);
        },
      });
      return;
    }

    this.clubApi
      .create({
        ...payload,
        createdBy: this.authService.currentUsername() || 'admin',
      })
      .subscribe({
        next: (created) => {
          this.saving.set(false);
          this.modalOpen.set(false);
          this.toastService.success('Club creado', `"${created.name}" ha sido registrado.`);
          this.loadClubs();
        },
        error: (err) => {
          this.saving.set(false);
          const parsed = parseApiError(err);
          this.toastService.error(parsed.title, parsed.message);
        },
      });
  }

  protected async deleteClub(club: Club): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Eliminar club',
      message: `¿Deseas eliminar el club "${club.name}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      variant: 'danger',
    });

    if (!confirmed) return;

    this.clubApi.delete(club.id).subscribe({
      next: () => {
        this.toastService.success('Club eliminado', `"${club.name}" fue eliminado.`);
        this.loadClubs();
      },
      error: (err) => {
        const parsed = parseApiError(err);
        this.toastService.error(parsed.title, parsed.message);
      },
    });
  }
}
