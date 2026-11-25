import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'clubs',
        loadComponent: () =>
          import('./features/clubs/clubs-list/clubs-list.component').then(
            (m) => m.ClubsListComponent
          ),
      },
      {
        path: 'clubs/:id',
        loadComponent: () =>
          import('./features/clubs/club-detail/club-detail.component').then(
            (m) => m.ClubDetailComponent
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/users-list/users-list.component').then(
            (m) => m.UsersListComponent
          ),
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./features/events/events-list/events-list.component').then(
            (m) => m.EventsListComponent
          ),
      },
      {
        path: 'events/:id',
        loadComponent: () =>
          import('./features/events/event-detail/event-detail.component').then(
            (m) => m.EventDetailComponent
          ),
      },
      {
        path: 'events/:eventId/matches/:matchId/lineups',
        loadComponent: () =>
          import('./features/events/match-lineups/match-lineups.component').then(
            (m) => m.MatchLineupsComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
