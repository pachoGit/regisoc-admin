import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Club, CreateClubRequest, UpdateClubRequest } from '../models/club.model';
import { BaseApiService } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class ClubApi extends BaseApiService {
  getAll(name?: string): Observable<Club[]> {
    let params = new HttpParams();
    if (name && name.trim()) {
      params = params.set('name', name.trim());
    }
    return this.http.get<Club[]>(this.url('/clubs'), { params });
  }

  getById(id: number): Observable<Club> {
    return this.http.get<Club>(this.url(`/clubs/${id}`));
  }

  create(request: CreateClubRequest): Observable<Club> {
    return this.http.post<Club>(this.url('/clubs'), request);
  }

  update(id: number, request: UpdateClubRequest): Observable<void> {
    return this.http.put<void>(this.url(`/clubs/${id}`), request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.url(`/clubs/${id}`));
  }
}
