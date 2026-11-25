import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventApi } from '../../../core/api/event.api';
import { EventStatus, SportEvent } from '../../../core/models/event.model';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../core/services/toast.service';
import { parseApiError } from '../../../core/utils/api-error.parser';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-events-list',
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
  templateUrl: './events-list.component.html',
  styleUrl: './events-list.component.scss',
})
export class EventsListComponent implements OnInit {
  private readonly eventApi = inject(EventApi);
  private readonly toastService = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(true);
  protected readonly events = signal<SportEvent[]>([]);
  protected readonly statusFilter = signal<'ALL' | EventStatus>('ALL');
  protected readonly search = signal('');

  protected readonly modalOpen = signal(false);
  protected readonly saving = signal(false);

  protected readonly filteredEvents = computed(() => {
    const status = this.statusFilter();
    const query = this.search().trim().toLowerCase();
    return this.events().filter((e) => {
      if (status !== 'ALL' && e.status !== status) return false;
      if (!query) return true;
      return (
        e.name.toLowerCase().includes(query) ||
        (e.location ?? '').toLowerCase().includes(query)
      );
    });
  });

  protected readonly form = this.fb.group({
    name: ['', [Validators.required]],
    location: [''],
    description: [''],
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.loadEvents();
  }

  protected loadEvents(): void {
    this.loading.set(true);
    this.eventApi.getAll().subscribe({
      next: (events) => {
        this.events.set(events);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        const parsed = parseApiError(err);
        this.toastService.error(parsed.title, parsed.message);
      },
    });
  }

  protected openCreateModal(): void {
    this.form.reset({
      name: '',
      location: '',
      description: '',
      startDate: '',
      endDate: '',
    });
    this.modalOpen.set(true);
  }

  protected closeModal(): void {
    this.modalOpen.set(false);
  }

  protected createEvent(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    if (raw.startDate && raw.endDate && raw.endDate < raw.startDate) {
      this.toastService.warning(
        'Fechas inválidas',
        'La fecha de fin debe ser posterior a la fecha de inicio.'
      );
      return;
    }

    this.saving.set(true);
    this.eventApi
      .create({
        name: (raw.name ?? '').trim(),
        location: raw.location?.trim() || null,
        description: raw.description?.trim() || null,
        startDate: raw.startDate ?? '',
        endDate: raw.endDate ?? '',
      })
      .subscribe({
        next: (created) => {
          this.saving.set(false);
          this.modalOpen.set(false);
          this.toastService.success('Evento creado', `"${created.name}" fue registrado.`);
          this.loadEvents();
        },
        error: (err) => {
          this.saving.set(false);
          const parsed = parseApiError(err);
          this.toastService.error(parsed.title, parsed.message);
        },
      });
  }

  protected async startEvent(event: SportEvent): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Iniciar evento',
      message: `¿Confirmas iniciar "${event.name}"? El estado pasará a En curso.`,
      confirmText: 'Iniciar evento',
      variant: 'primary',
    });
    if (!confirmed) return;

    this.eventApi.start(event.id).subscribe({
      next: () => {
        this.toastService.success('Evento iniciado', `"${event.name}" está en curso.`);
        this.loadEvents();
      },
      error: (err) => {
        const parsed = parseApiError(err);
        this.toastService.error(parsed.title, parsed.message);
      },
    });
  }

  protected async finishEvent(event: SportEvent): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Finalizar evento',
      message: `¿Confirmas finalizar "${event.name}"? Una vez finalizado no podrá volver a abrirse.`,
      confirmText: 'Finalizar evento',
      variant: 'warning',
    });
    if (!confirmed) return;

    this.eventApi.finish(event.id).subscribe({
      next: () => {
        this.toastService.success('Evento finalizado', `"${event.name}" fue marcado como finalizado.`);
        this.loadEvents();
      },
      error: (err) => {
        const parsed = parseApiError(err);
        this.toastService.error(parsed.title, parsed.message);
      },
    });
  }
}
