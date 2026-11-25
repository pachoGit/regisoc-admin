import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';
import { API_BASE_URL } from '../config/api.tokens';
import { AuthSession } from '../models/auth.model';
import { AuthService, isJwtExpired } from './auth.service';
import { SessionStoragePort } from './session-storage.port';

class InMemorySessionStorage extends SessionStoragePort {
  private value: AuthSession | null = null;
  read(): AuthSession | null {
    return this.value;
  }
  write(session: AuthSession): void {
    this.value = session;
  }
  clear(): void {
    this.value = null;
  }
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let storage: InMemorySessionStorage;
  let router: Router;

  beforeEach(() => {
    storage = new InMemorySessionStorage();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: SessionStoragePort, useValue: storage },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('logs in ADMIN users and stores session', async () => {
    const loginPromise = firstValueFrom(service.login({ username: 'admin', password: 'secret' }));

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({
      token: 'jwt-token',
      userId: 1,
      username: 'admin',
      role: 'ADMIN',
      clubId: null,
    });

    const session = await loginPromise;
    expect(session.token).toBe('jwt-token');
    expect(service.isAuthenticated()).toBe(true);
    expect(storage.read()?.username).toBe('admin');
  });

  it('rejects CLUB_MANAGER users on admin portal', async () => {
    const loginPromise = firstValueFrom(service.login({ username: 'manager', password: 'secret' }));

    const req = httpMock.expectOne('/api/auth/login');
    req.flush({
      token: 'jwt-manager',
      userId: 2,
      username: 'manager',
      role: 'CLUB_MANAGER',
      clubId: 10,
    });

    await expect(loginPromise).rejects.toThrow('exclusivo para usuarios administradores');
    expect(service.isAuthenticated()).toBe(false);
    expect(storage.read()).toBeNull();
  });

  it('clears session and redirects on logout', async () => {
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const loginPromise = firstValueFrom(service.login({ username: 'admin', password: 'secret' }));
    httpMock.expectOne('/api/auth/login').flush({
      token: 'jwt-token',
      userId: 1,
      username: 'admin',
      role: 'ADMIN',
      clubId: null,
    });
    await loginPromise;

    const logoutPromise = firstValueFrom(service.logout());
    const logoutReq = httpMock.expectOne('/api/auth/logout');
    expect(logoutReq.request.body).toEqual({ token: 'jwt-token' });
    logoutReq.flush({ message: 'Logged out successfully' });

    await logoutPromise;
    expect(service.isAuthenticated()).toBe(false);
    expect(storage.read()).toBeNull();
    expect(navSpy).toHaveBeenCalledWith(['/login']);
  });

  it('detects expired JWT tokens', () => {
    const expiredPayload = btoa(JSON.stringify({ sub: 'admin', exp: 1000 }));
    const validPayload = btoa(JSON.stringify({ sub: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 }));

    expect(isJwtExpired(`hdr.${expiredPayload}.sig`)).toBe(true);
    expect(isJwtExpired(`hdr.${validPayload}.sig`)).toBe(false);
  });
});
