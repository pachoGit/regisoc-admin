import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateMatchRequest, Match } from '../models/match.model';
import { BaseApiService } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class MatchApi extends BaseApiService {
  getByMatchDate(matchDateId: number): Observable<Match[]> {
    const params = new HttpParams().set('matchDateId', matchDateId);
    return this.http.get<Match[]>(this.url('/matches'), { params });
  }

  getByClub(clubId: number): Observable<Match[]> {
    const params = new HttpParams().set('clubId', clubId);
    return this.http.get<Match[]>(this.url('/matches'), { params });
  }

  getById(id: number): Observable<Match> {
    return this.http.get<Match>(this.url(`/matches/${id}`));
  }

  create(request: CreateMatchRequest): Observable<Match> {
    return this.http.post<Match>(this.url('/matches'), request);
  }
}
