import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Lineup } from '../models/lineup.model';
import { BaseApiService } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class LineupApi extends BaseApiService {
  getByMatch(matchId: number): Observable<Lineup[]> {
    return this.http.get<Lineup[]>(this.url(`/lineups/match/${matchId}`));
  }

  getByMatchAndClub(matchId: number, clubId: number): Observable<Lineup> {
    return this.http.get<Lineup>(this.url(`/lineups/match/${matchId}/club/${clubId}`));
  }

  close(lineupId: number): Observable<void> {
    return this.http.put<void>(this.url(`/lineups/close/${lineupId}`), {});
  }
}
