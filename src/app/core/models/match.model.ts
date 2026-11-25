export type MatchDateStatus = 'UPCOMING' | 'ONGOING' | 'FINISHED' | 'CANCELED';

export type MatchStatus = 'UPCOMING' | 'ONGOING' | 'FINISHED' | 'CANCELED';

export interface MatchDate {
  id: number;
  eventId: number;
  name: string;
  date: string;
  status: MatchDateStatus;
  match?: Match | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMatchDateRequest {
  eventId: number;
  name: string;
  date: string;
  status?: MatchDateStatus;
}

export interface Match {
  id: number;
  matchDateId: number;
  homeClubId: number;
  awayClubId: number;
  scheduledTime: string;
  status: MatchStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMatchRequest {
  matchDateId: number;
  homeClubId: number;
  awayClubId: number;
  scheduledTime: string;
}
