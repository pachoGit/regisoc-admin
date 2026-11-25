import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateMatchDateRequest, MatchDate } from '../models/match.model';
import { BaseApiService } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class MatchDateApi extends BaseApiService {
  getByEvent(eventId: number): Observable<MatchDate[]> {
    return this.http.get<MatchDate[]>(this.url(`/match-dates/by-event/${eventId}`));
  }

  create(request: CreateMatchDateRequest): Observable<MatchDate> {
    return this.http.post<MatchDate>(this.url('/match-dates'), request);
  }

  start(id: number): Observable<void> {
    return this.http.post<void>(this.url(`/match-dates/${id}/start`), {});
  }
}
