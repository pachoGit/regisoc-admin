import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { AuthApi } from '../api/auth.api';
import { AuthSession, LoginRequest, MeResponse } from '../models/auth.model';
import { SessionStoragePort } from './session-storage.port';

export function isJwtExpired(token: string, nowMs = Date.now()): boolean {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded)) as { exp?: unknown };
    if (typeof payload.exp !== 'number') {
      return false;
    }
    return payload.exp * 1000 <= nowMs;
  } catch {
    return false;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApi = inject(AuthApi);
  private readonly storage = inject(SessionStoragePort);
  private readonly router = inject(Router);

  private readonly sessionSignal = signal<AuthSession | null>(this.storage.read());
  private readonly profileSignal = signal<MeResponse | null>(null);

  readonly session = this.sessionSignal.asReadonly();
  readonly profile = this.profileSignal.asReadonly();
  readonly token = computed(() => this.sessionSignal()?.token ?? null);
  readonly isAuthenticated = computed(() => {
    const s = this.sessionSignal();
    return Boolean(s?.token && s.role === 'ADMIN' && !isJwtExpired(s.token));
  });
  readonly currentUsername = computed(
    () => this.profileSignal()?.username ?? this.sessionSignal()?.username ?? ''
  );
  readonly displayName = computed(() => {
    const p = this.profileSignal();
    if (p) return `${p.name} ${p.surname}`.trim();
    return this.sessionSignal()?.username ?? 'Administrador';
  });

  login(credentials: LoginRequest): Observable<AuthSession> {
    return this.authApi.login(credentials).pipe(
      map((res) => {
        if (res.role !== 'ADMIN') {
          throw new Error(
            'Este portal es exclusivo para usuarios administradores. Los gestores de club deben usar la aplicación móvil.'
          );
        }
        const session: AuthSession = {
          token: res.token,
          userId: res.userId,
          username: res.username,
          role: res.role,
          clubId: res.clubId,
        };
        return session;
      }),
      tap((session) => {
        this.storage.write(session);
        this.sessionSignal.set(session);
      }),
      catchError((err) => throwError(() => err))
    );
  }

  loadProfile(): Observable<MeResponse | null> {
    if (!this.isAuthenticated()) {
      return of(null);
    }
    return this.authApi.me().pipe(
      tap((profile) => this.profileSignal.set(profile)),
      catchError(() => of(null))
    );
  }

  validateSession(): Observable<boolean> {
    const s = this.sessionSignal();
    if (!s?.token || s.role !== 'ADMIN' || isJwtExpired(s.token)) {
      this.clearSession(false);
      return of(false);
    }
    if (this.profileSignal()) {
      return of(true);
    }
    return this.authApi.me().pipe(
      tap((profile) => this.profileSignal.set(profile)),
      map((profile) => profile.role === 'ADMIN'),
      catchError(() => {
        this.clearSession(false);
        return of(false);
      })
    );
  }

  logout(): Observable<void> {
    const currentToken = this.token();
    const request$ = currentToken
      ? this.authApi.logout({ token: currentToken }).pipe(catchError(() => of(null)))
      : of(null);

    return request$.pipe(
      tap(() => this.clearSession(true)),
      map(() => void 0)
    );
  }

  clearSession(redirectToLogin = false): void {
    this.storage.clear();
    this.sessionSignal.set(null);
    this.profileSignal.set(null);
    if (redirectToLogin) {
      void this.router.navigate(['/login']);
    }
  }
}
