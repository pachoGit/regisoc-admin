import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatchDate } from '../../../core/models/match.model';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { EventDetailFacade } from './event-detail.facade';

type EventTab = 'matchDates' | 'clubs';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  providers: [EventDetailFacade],
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ModalComponent,
  ],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.scss',
})
export class EventDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toastService = inject(ToastService);
  protected readonly facade = inject(EventDetailFacade);

  protected readonly eventId = signal<number>(0);
  protected readonly activeTab = signal<EventTab>('matchDates');

  protected readonly registerClubModalOpen = signal(false);
  protected readonly matchDateModalOpen = signal(false);
  protected readonly matchModalOpen = signal(false);
  protected readonly targetMatchDate = signal<MatchDate | null>(null);

  protected readonly registerClubForm = this.fb.group({
    clubId: [null as number | null, [Validators.required]],
  });

  protected readonly matchDateForm = this.fb.group({
    name: ['', [Validators.required]],
    date: ['', [Validators.required]],
  });

  protected readonly matchForm = this.fb.group({
    homeClubId: [null as number | null, [Validators.required]],
    awayClubId: [null as number | null, [Validators.required]],
    scheduledTime: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) return;
    this.eventId.set(id);
    this.facade.load(id);
  }

  protected async onStartEvent(): Promise<void> {
    const ev = this.facade.event();
    if (!ev) return;
    const confirmed = await this.confirmDialog.confirm({
      title: 'Iniciar evento',
      message: `¿Confirmas iniciar "${ev.name}"?`,
      confirmText: 'Iniciar evento',
      variant: 'primary',
    });
    if (confirmed) {
      this.facade.startEvent(ev.id);
    }
  }

  protected async onFinishEvent(): Promise<void> {
    const ev = this.facade.event();
    if (!ev) return;
    const confirmed = await this.confirmDialog.confirm({
      title: 'Finalizar evento',
      message: `¿Confirmas finalizar "${ev.name}"?`,
      confirmText: 'Finalizar evento',
      variant: 'warning',
    });
    if (confirmed) {
      this.facade.finishEvent(ev.id);
    }
  }

  protected openRegisterClubModal(): void {
    this.registerClubForm.reset({ clubId: null });
    this.registerClubModalOpen.set(true);
  }

  protected submitRegisterClub(): void {
    if (this.registerClubForm.invalid) {
      this.registerClubForm.markAllAsTouched();
      return;
    }
    const clubId = Number(this.registerClubForm.controls.clubId.value);
    this.facade.registerClub(this.eventId(), clubId, () => {
      this.registerClubModalOpen.set(false);
    });
  }

  protected openMatchDateModal(): void {
    const nextNumber = this.facade.matchDates().length + 1;
    this.matchDateForm.reset({
      name: `Fecha ${nextNumber}`,
      date: '',
    });
    this.matchDateModalOpen.set(true);
  }

  protected submitMatchDate(): void {
    if (this.matchDateForm.invalid) {
      this.matchDateForm.markAllAsTouched();
      return;
    }
    const raw = this.matchDateForm.getRawValue();
    this.facade.createMatchDate(
      {
        eventId: this.eventId(),
        name: (raw.name ?? '').trim(),
        date: raw.date ?? '',
        status: 'UPCOMING',
      },
      () => {
        this.matchDateModalOpen.set(false);
      }
    );
  }

  protected async onStartMatchDate(matchDate: MatchDate): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Iniciar fecha deportiva',
      message: `¿Confirmas iniciar "${matchDate.name}"?`,
      confirmText: 'Iniciar fecha',
      variant: 'primary',
    });
    if (confirmed) {
      this.facade.startMatchDate(this.eventId(), matchDate.id);
    }
  }

  protected openMatchModal(matchDate: MatchDate): void {
    if (this.facade.registeredClubs().length < 2) {
      this.toastService.warning(
        'Clubes insuficientes',
        'Inscribe al menos 2 clubes en el evento antes de programar un partido.'
      );
      return;
    }
    this.targetMatchDate.set(matchDate);
    this.matchForm.reset({
      homeClubId: null,
      awayClubId: null,
      scheduledTime: `${matchDate.date}T15:00`,
    });
    this.matchModalOpen.set(true);
  }

  protected submitMatch(): void {
    const matchDate = this.targetMatchDate();
    if (!matchDate || this.matchForm.invalid) {
      this.matchForm.markAllAsTouched();
      return;
    }

    const raw = this.matchForm.getRawValue();
    const homeClubId = Number(raw.homeClubId);
    const awayClubId = Number(raw.awayClubId);

    if (homeClubId === awayClubId) {
      this.toastService.warning(
        'Rivales inválidos',
        'El club local y el club visitante deben ser distintos.'
      );
      return;
    }

    const scheduledTime =
      raw.scheduledTime && raw.scheduledTime.length === 16
        ? `${raw.scheduledTime}:00`
        : (raw.scheduledTime ?? '');

    this.facade.createMatch(
      this.eventId(),
      {
        matchDateId: matchDate.id,
        homeClubId,
        awayClubId,
        scheduledTime,
      },
      () => {
        this.matchModalOpen.set(false);
      }
    );
  }
}
