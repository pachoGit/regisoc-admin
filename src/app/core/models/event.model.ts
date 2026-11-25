export type EventStatus = 'UPCOMING' | 'ONGOING' | 'FINISHED';

export interface SportEvent {
  id: number;
  name: string;
  location: string | null;
  description: string | null;
  startDate: string;
  endDate: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  name: string;
  location: string | null;
  description: string | null;
  startDate: string;
  endDate: string;
}

export interface EventRegistration {
  id: number;
  eventId: number;
  clubId: number;
  registeredAt: string;
}

export interface RegisterClubRequest {
  clubId: number;
}
