import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ClubApi } from '../../../core/api/club.api';
import { LineupApi } from '../../../core/api/lineup.api';
import { MatchApi } from '../../../core/api/match.api';
import { Club } from '../../../core/models/club.model';
import { Lineup } from '../../../core/models/lineup.model';
import { Match } from '../../../core/models/match.model';
import { DocumentPerson } from '../../../core/models/roster.model';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../core/services/toast.service';
import { parseApiError } from '../../../core/utils/api-error.parser';
import { DocumentViewerModalComponent } from '../../../shared/components/document-viewer-modal/document-viewer-modal.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LineupCardComponent } from './components/lineup-card/lineup-card.component';

@Component({
  selector: 'app-match-lineups',
  standalone: true,
  imports: [
    DatePipe,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    DocumentViewerModalComponent,
    LineupCardComponent,
  ],
  templateUrl: './match-lineups.component.html',
  styleUrl: './match-lineups.component.scss',
})
export class MatchLineupsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly matchApi = inject(MatchApi);
  private readonly lineupApi = inject(LineupApi);
  private readonly clubApi = inject(ClubApi);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toastService = inject(ToastService);

  protected readonly eventId = signal<number>(0);
  protected readonly matchId = signal<number>(0);
  protected readonly loading = signal(true);
  protected readonly closingId = signal<number | null>(null);

  protected readonly match = signal<Match | null>(null);
  protected readonly lineups = signal<Lineup[]>([]);
  protected readonly clubs = signal<Club[]>([]);

  protected readonly selectedPerson = signal<DocumentPerson | null>(null);
  protected readonly selectedRoleLabel = signal<string>('Integrante');

  protected readonly clubMap = computed(() => {
    const map = new Map<number, Club>();
    for (const c of this.clubs()) map.set(c.id, c);
    return map;
  });

  protected readonly homeClubName = computed(() => {
    const m = this.match();
    if (!m) return 'Local';
    return this.clubMap().get(m.homeClubId)?.name ?? `Club #${m.homeClubId}`;
  });

  protected readonly awayClubName = computed(() => {
    const m = this.match();
    if (!m) return 'Visitante';
    return this.clubMap().get(m.awayClubId)?.name ?? `Club #${m.awayClubId}`;
  });

  protected readonly homeLineup = computed(() => {
    const m = this.match();
    return m ? (this.lineups().find((l) => l.clubId === m.homeClubId) ?? null) : null;
  });

  protected readonly awayLineup = computed(() => {
    const m = this.match();
    return m ? (this.lineups().find((l) => l.clubId === m.awayClubId) ?? null) : null;
  });

  ngOnInit(): void {
    const eventId = Number(this.route.snapshot.paramMap.get('eventId'));
    const matchId = Number(this.route.snapshot.paramMap.get('matchId'));
    this.eventId.set(eventId);
    this.matchId.set(matchId);
    this.loadData(matchId);
  }

  protected loadData(matchId: number): void {
    this.loading.set(true);
    forkJoin({
      match: this.matchApi.getById(matchId),
      lineups: this.lineupApi.getByMatch(matchId),
      clubs: this.clubApi.getAll(),
    }).subscribe({
      next: ({ match, lineups, clubs }) => {
        this.match.set(match);
        this.lineups.set(lineups);
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

  protected async closeLineup(lineup: Lineup, clubName: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Cerrar planilla',
      message: `¿Confirmas cerrar la planilla de "${clubName}"? El gestor del club ya no podrá modificarla.`,
      confirmText: 'Cerrar planilla',
      variant: 'warning',
    });
    if (!confirmed) return;

    this.closingId.set(lineup.id);
    this.lineupApi.close(lineup.id).subscribe({
      next: () => {
        this.closingId.set(null);
        this.toastService.success('Planilla cerrada', `La planilla de "${clubName}" fue cerrada.`);
        this.loadData(this.matchId());
      },
      error: (err) => {
        this.closingId.set(null);
        const parsed = parseApiError(err);
        this.toastService.error(parsed.title, parsed.message);
      },
    });
  }

  protected openDocuments(event: { person: DocumentPerson; roleLabel: string }): void {
    this.selectedPerson.set(event.person);
    this.selectedRoleLabel.set(event.roleLabel);
  }

  protected printSheet(): void {
    window.print();
  }
}
