import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin, of, switchMap } from 'rxjs';
import { ClubApi } from '../../../core/api/club.api';
import { EventApi } from '../../../core/api/event.api';
import { MatchDateApi } from '../../../core/api/match-date.api';
import { MatchApi } from '../../../core/api/match.api';
import { Club } from '../../../core/models/club.model';
import { EventRegistration, SportEvent } from '../../../core/models/event.model';
import {
  CreateMatchDateRequest,
  CreateMatchRequest,
  Match,
  MatchDate,
} from '../../../core/models/match.model';
import { ToastService } from '../../../core/services/toast.service';
import { parseApiError } from '../../../core/utils/api-error.parser';

@Injectable()
export class EventDetailFacade {
  private readonly eventApi = inject(EventApi);
  private readonly clubApi = inject(ClubApi);
  private readonly matchDateApi = inject(MatchDateApi);
  private readonly matchApi = inject(MatchApi);
  private readonly toastService = inject(ToastService);

  readonly loading = signal(true);
  readonly busy = signal(false);

  readonly event = signal<SportEvent | null>(null);
  readonly allClubs = signal<Club[]>([]);
  readonly registrations = signal<EventRegistration[]>([]);
  readonly matchDates = signal<MatchDate[]>([]);
  readonly matchesByDate = signal<Record<number, Match[]>>({});

  readonly clubMap = computed(() => {
    const map = new Map<number, Club>();
    for (const club of this.allClubs()) {
      map.set(club.id, club);
    }
    return map;
  });

  readonly registeredClubIds = computed(() => new Set(this.registrations().map((r) => r.clubId)));

  readonly registeredClubs = computed(() => {
    const map = this.clubMap();
    return this.registrations()
      .map((reg) => ({
        registration: reg,
        club: map.get(reg.clubId) ?? null,
      }))
      .filter((item): item is { registration: EventRegistration; club: Club } => item.club !== null);
  });

  readonly availableClubsToRegister = computed(() => {
    const registered = this.registeredClubIds();
    return this.allClubs().filter((c) => !registered.has(c.id));
  });

  load(eventId: number): void {
    this.loading.set(true);
    forkJoin({
      event: this.eventApi.getById(eventId),
      clubs: this.clubApi.getAll(),
      registrations: this.eventApi.getRegistrations(eventId),
      matchDates: this.matchDateApi.getByEvent(eventId),
    })
      .pipe(
        switchMap((data) => {
          if (data.matchDates.length === 0) {
            return of({ ...data, matchesRecord: {} as Record<number, Match[]> });
          }
          const matchRequests: Record<number, ReturnType<MatchApi['getByMatchDate']>> = {};
          for (const md of data.matchDates) {
            matchRequests[md.id] = this.matchApi.getByMatchDate(md.id);
          }
          return forkJoin(matchRequests).pipe(
            switchMap((matchesRecord) => of({ ...data, matchesRecord }))
          );
        })
      )
      .subscribe({
        next: ({ event, clubs, registrations, matchDates, matchesRecord }) => {
          this.event.set(event);
          this.allClubs.set(clubs);
          this.registrations.set(registrations);
          this.matchDates.set(matchDates);
          this.matchesByDate.set(matchesRecord);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          const parsed = parseApiError(err);
          this.toastService.error(parsed.title, parsed.message);
        },
      });
  }

  startEvent(eventId: number): void {
    this.busy.set(true);
    this.eventApi.start(eventId).subscribe({
      next: () => {
        this.busy.set(false);
        this.toastService.success('Evento iniciado', 'El evento pasó a estado En curso.');
        this.load(eventId);
      },
      error: (err) => {
        this.busy.set(false);
        const parsed = parseApiError(err);
        this.toastService.error(parsed.title, parsed.message);
      },
    });
  }

  finishEvent(eventId: number): void {
    this.busy.set(true);
    this.eventApi.finish(eventId).subscribe({
      next: () => {
        this.busy.set(false);
        this.toastService.success('Evento finalizado', 'El evento fue finalizado.');
        this.load(eventId);
      },
      error: (err) => {
        this.busy.set(false);
        const parsed = parseApiError(err);
        this.toastService.error(parsed.title, parsed.message);
      },
    });
  }

  registerClub(eventId: number, clubId: number, onSuccess?: () => void): void {
    this.busy.set(true);
    this.eventApi.registerClub(eventId, { clubId }).subscribe({
      next: () => {
        this.busy.set(false);
        this.toastService.success('Club inscrito', 'El club fue inscrito en el evento.');
        onSuccess?.();
        this.load(eventId);
      },
      error: (err) => {
        this.busy.set(false);
        const parsed = parseApiError(err);
        this.toastService.error(parsed.title, parsed.message);
      },
    });
  }

  createMatchDate(request: CreateMatchDateRequest, onSuccess?: () => void): void {
    this.busy.set(true);
    this.matchDateApi.create(request).subscribe({
      next: () => {
        this.busy.set(false);
        this.toastService.success('Fecha creada', `La jornada "${request.name}" fue agregada.`);
        onSuccess?.();
        this.load(request.eventId);
      },
      error: (err) => {
        this.busy.set(false);
        const parsed = parseApiError(err);
        this.toastService.error(parsed.title, parsed.message);
      },
    });
  }

  startMatchDate(eventId: number, matchDateId: number): void {
    this.busy.set(true);
    this.matchDateApi.start(matchDateId).subscribe({
      next: () => {
        this.busy.set(false);
        this.toastService.success('Fecha iniciada', 'La jornada deportiva está en curso.');
        this.load(eventId);
      },
      error: (err) => {
        this.busy.set(false);
        const parsed = parseApiError(err);
        this.toastService.error(parsed.title, parsed.message);
      },
    });
  }

  createMatch(eventId: number, request: CreateMatchRequest, onSuccess?: () => void): void {
    this.busy.set(true);
    this.matchApi.create(request).subscribe({
      next: () => {
        this.busy.set(false);
        this.toastService.success('Partido agregado', 'El enfrentamiento fue programado.');
        onSuccess?.();
        this.load(eventId);
      },
      error: (err) => {
        this.busy.set(false);
        const parsed = parseApiError(err);
        this.toastService.error(parsed.title, parsed.message);
      },
    });
  }

  getClubName(clubId: number): string {
    return this.clubMap().get(clubId)?.name ?? `Club #${clubId}`;
  }
}
