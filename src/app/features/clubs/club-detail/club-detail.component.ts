import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ClubApi } from '../../../core/api/club.api';
import { RosterApi } from '../../../core/api/roster.api';
import { Club } from '../../../core/models/club.model';
import { Coach, DocumentPerson, PhysicalTrainer, Player } from '../../../core/models/roster.model';
import { ToastService } from '../../../core/services/toast.service';
import { parseApiError } from '../../../core/utils/api-error.parser';
import { DocumentViewerModalComponent } from '../../../shared/components/document-viewer-modal/document-viewer-modal.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

type RosterTab = 'players' | 'coaches' | 'trainers';

@Component({
  selector: 'app-club-detail',
  standalone: true,
  imports: [
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    DocumentViewerModalComponent,
  ],
  templateUrl: './club-detail.component.html',
  styleUrl: './club-detail.component.scss',
})
export class ClubDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly clubApi = inject(ClubApi);
  private readonly rosterApi = inject(RosterApi);
  private readonly toastService = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly activeTab = signal<RosterTab>('players');
  protected readonly club = signal<Club | null>(null);
  protected readonly players = signal<Player[]>([]);
  protected readonly coaches = signal<Coach[]>([]);
  protected readonly trainers = signal<PhysicalTrainer[]>([]);

  protected readonly selectedPerson = signal<DocumentPerson | null>(null);
  protected readonly selectedRoleLabel = signal<string>('Integrante');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) return;
    this.loadClubRoster(id);
  }

  protected loadClubRoster(clubId: number): void {
    this.loading.set(true);
    forkJoin({
      club: this.clubApi.getById(clubId),
      players: this.rosterApi.getPlayersByClub(clubId),
      coaches: this.rosterApi.getCoachesByClub(clubId),
      trainers: this.rosterApi.getPhysicalTrainersByClub(clubId),
    }).subscribe({
      next: ({ club, players, coaches, trainers }) => {
        this.club.set(club);
        this.players.set(players);
        this.coaches.set(coaches);
        this.trainers.set(trainers);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        const parsed = parseApiError(err);
        this.toastService.error(parsed.title, parsed.message);
      },
    });
  }

  protected setTab(tab: RosterTab): void {
    this.activeTab.set(tab);
  }

  protected hasCompleteDocuments(person: DocumentPerson): boolean {
    return Boolean(person.photoUrl && person.documentFrontUrl && person.documentBackUrl);
  }

  protected openDocuments(person: DocumentPerson, roleLabel: string): void {
    this.selectedPerson.set(person);
    this.selectedRoleLabel.set(roleLabel);
  }

  protected closeDocuments(): void {
    this.selectedPerson.set(null);
  }
}
