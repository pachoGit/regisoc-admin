import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateEventRequest,
  EventRegistration,
  RegisterClubRequest,
  SportEvent,
} from '../models/event.model';
import { BaseApiService } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class EventApi extends BaseApiService {
  getAll(): Observable<SportEvent[]> {
    return this.http.get<SportEvent[]>(this.url('/events'));
  }

  getById(id: number): Observable<SportEvent> {
    return this.http.get<SportEvent>(this.url(`/events/${id}`));
  }

  create(request: CreateEventRequest): Observable<SportEvent> {
    return this.http.post<SportEvent>(this.url('/events'), request);
  }

  start(id: number): Observable<void> {
    return this.http.post<void>(this.url(`/events/${id}/start`), {});
  }

  finish(id: number): Observable<void> {
    return this.http.post<void>(this.url(`/events/${id}/finish`), {});
  }

  getRegistrations(eventId: number): Observable<EventRegistration[]> {
    return this.http.get<EventRegistration[]>(this.url(`/events/${eventId}/registrations`));
  }

  registerClub(eventId: number, request: RegisterClubRequest): Observable<EventRegistration> {
    return this.http.post<EventRegistration>(
      this.url(`/events/${eventId}/registrations`),
      request
    );
  }
}
