import { DocumentPerson, PlayerPosition } from './roster.model';

export type LineupStatus = 'OPEN' | 'CLOSE';

export interface LineupPlayer extends DocumentPerson {
  playerId: number;
  position: PlayerPosition | null;
}

export interface LineupCoach extends DocumentPerson {
  coachId: number;
}

export interface LineupPhysicalTrainer extends DocumentPerson {
  physicalTrainerId: number;
}

export interface Lineup {
  id: number;
  matchId: number;
  clubId: number;
  status: LineupStatus;
  players: LineupPlayer[];
  coach: LineupCoach | null;
  physicalTrainer: LineupPhysicalTrainer | null;
  createdAt: string;
  updatedAt: string;
}
