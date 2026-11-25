import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Coach, PhysicalTrainer, Player } from '../models/roster.model';
import { BaseApiService } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class RosterApi extends BaseApiService {
  getPlayersByClub(clubId: number): Observable<Player[]> {
    const params = new HttpParams().set('clubId', clubId);
    return this.http.get<Player[]>(this.url('/players'), { params });
  }

  getCoachesByClub(clubId: number): Observable<Coach[]> {
    const params = new HttpParams().set('clubId', clubId);
    return this.http.get<Coach[]>(this.url('/coaches'), { params });
  }

  getPhysicalTrainersByClub(clubId: number): Observable<PhysicalTrainer[]> {
    const params = new HttpParams().set('clubId', clubId);
    return this.http.get<PhysicalTrainer[]>(this.url('/physical-trainers'), { params });
  }
}
