import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, isObservable, of } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../auth/auth.service';
import { authGuard, guestGuard } from './auth.guard';

describe('Auth Guards', () => {
  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = {} as RouterStateSnapshot;

  function setup(authenticated: boolean, sessionValid = true): void {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: signal(authenticated).asReadonly(),
            validateSession: vi.fn(() => of(sessionValid)),
            clearSession: vi.fn(),
          },
        },
      ],
    });
  }

  it('authGuard allows access when authenticated and session is valid', async () => {
    setup(true, true);
    const raw = TestBed.runInInjectionContext(() => authGuard(dummyRoute, dummyState));
    const result = isObservable(raw) ? await firstValueFrom(raw) : raw;
    expect(result).toBe(true);
  });

  it('authGuard redirects to /login when server rejects session (e.g. 403)', async () => {
    setup(true, false);
    const raw = TestBed.runInInjectionContext(() => authGuard(dummyRoute, dummyState));
    const result = isObservable(raw) ? await firstValueFrom(raw) : raw;
    expect(result instanceof UrlTree).toBe(true);
    expect((result as UrlTree).toString()).toBe('/login');
  });

  it('authGuard redirects to /login when unauthenticated or token expired', () => {
    setup(false);
    const result = TestBed.runInInjectionContext(() => authGuard(dummyRoute, dummyState));
    expect(result instanceof UrlTree).toBe(true);
    expect((result as UrlTree).toString()).toBe('/login');
  });

  it('guestGuard redirects to /dashboard when already authenticated', () => {
    setup(true);
    const result = TestBed.runInInjectionContext(() => guestGuard(dummyRoute, dummyState));
    expect(result instanceof UrlTree).toBe(true);
    expect((result as UrlTree).toString()).toBe('/dashboard');
  });
});
