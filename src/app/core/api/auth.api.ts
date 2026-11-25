import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  MeResponse,
} from '../models/auth.model';
import { BaseApiService } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class AuthApi extends BaseApiService {
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.url('/auth/login'), request);
  }

  logout(request: LogoutRequest): Observable<LogoutResponse> {
    return this.http.post<LogoutResponse>(this.url('/auth/logout'), request);
  }

  me(): Observable<MeResponse> {
    return this.http.get<MeResponse>(this.url('/auth/me'));
  }
}
