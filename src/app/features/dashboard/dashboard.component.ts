import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ClubApi } from '../../core/api/club.api';
import { EventApi } from '../../core/api/event.api';
import { UserApi } from '../../core/api/user.api';
import { Club } from '../../core/models/club.model';
import { SportEvent } from '../../core/models/event.model';
import { User } from '../../core/models/user.model';
import { ToastService } from '../../core/services/toast.service';
import { parseApiError } from '../../core/utils/api-error.parser';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly clubApi = inject(ClubApi);
  private readonly userApi = inject(UserApi);
  private readonly eventApi = inject(EventApi);
  private readonly toastService = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly clubs = signal<Club[]>([]);
  protected readonly users = signal<User[]>([]);
  protected readonly events = signal<SportEvent[]>([]);

  protected readonly clubManagersCount = computed(
    () => this.users().filter((u) => u.role === 'CLUB_MANAGER').length
  );
  protected readonly ongoingEventsCount = computed(
    () => this.events().filter((e) => e.status === 'ONGOING').length
  );
  protected readonly upcomingEventsCount = computed(
    () => this.events().filter((e) => e.status === 'UPCOMING').length
  );
  protected readonly recentEvents = computed(() => this.events().slice(0, 6));

  ngOnInit(): void {
    this.loadSummary();
  }

  protected loadSummary(): void {
    this.loading.set(true);
    forkJoin({
      clubs: this.clubApi.getAll(),
      users: this.userApi.getAll(),
      events: this.eventApi.getAll(),
    }).subscribe({
      next: ({ clubs, users, events }) => {
        this.clubs.set(clubs);
        this.users.set(users);
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
}
