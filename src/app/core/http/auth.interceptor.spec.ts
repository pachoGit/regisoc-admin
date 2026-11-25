import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../auth/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  const tokenSignal = signal<string | null>('my-jwt-token');

  beforeEach(() => {
    tokenSignal.set('my-jwt-token');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { token: tokenSignal.asReadonly() } },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('attaches Authorization Bearer header for protected endpoints', () => {
    http.get('/api/clubs').subscribe();
    const req = httpMock.expectOne('/api/clubs');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-jwt-token');
    req.flush([]);
  });

  it('does not attach Authorization header on /auth/login', () => {
    http.post('/api/auth/login', {}).subscribe();
    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('omits Authorization header when token is null', () => {
    tokenSignal.set(null);
    http.get('/api/clubs').subscribe();
    const req = httpMock.expectOne('/api/clubs');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });
});
