export type PlayerPosition = 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';

export interface DocumentPerson {
  firstName: string;
  lastName: string;
  documentNumber: string;
  age: number;
  dateOfBirth: string;
  photoUrl: string | null;
  documentFrontUrl: string | null;
  documentBackUrl: string | null;
}

export interface Player extends DocumentPerson {
  id: number;
  clubId: number;
  position: PlayerPosition | null;
  createdAt: string;
  updatedAt: string;
}

export interface Coach extends DocumentPerson {
  id: number;
  clubId: number;
  createdAt: string;
  updatedAt: string;
}

export interface PhysicalTrainer extends DocumentPerson {
  id: number;
  clubId: number;
  createdAt: string;
  updatedAt: string;
}
