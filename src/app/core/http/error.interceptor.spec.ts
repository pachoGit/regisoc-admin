import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../services/toast.service';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let clearSessionSpy: ReturnType<typeof vi.fn>;
  let warningSpy: ReturnType<typeof vi.fn>;
  const tokenSignal = signal<string | null>('active-token');

  beforeEach(() => {
    tokenSignal.set('active-token');
    clearSessionSpy = vi.fn();
    warningSpy = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            token: tokenSignal.asReadonly(),
            clearSession: clearSessionSpy,
          },
        },
        {
          provide: ToastService,
          useValue: { warning: warningSpy },
        },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('clears session and redirects to login when server returns 403', () => {
    http.get('/api/clubs').subscribe({ error: () => void 0 });

    const req = httpMock.expectOne('/api/clubs');
    req.flush({ detail: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });

    expect(warningSpy).toHaveBeenCalledTimes(1);
    expect(clearSessionSpy).toHaveBeenCalledWith(true);
  });

  it('clears session and redirects to login when server returns 401', () => {
    http.get('/api/events').subscribe({ error: () => void 0 });

    const req = httpMock.expectOne('/api/events');
    req.flush({ detail: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(clearSessionSpy).toHaveBeenCalledWith(true);
  });

  it('does not clear session on /auth/login errors', () => {
    http.post('/api/auth/login', {}).subscribe({ error: () => void 0 });

    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ detail: 'Bad credentials' }, { status: 401, statusText: 'Unauthorized' });

    expect(clearSessionSpy).not.toHaveBeenCalled();
  });
});
