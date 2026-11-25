export interface Club {
  id: number;
  name: string;
  foundedYear: number | null;
  crestUrl: string | null;
  description: string | null;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClubRequest {
  name: string;
  foundedYear: number | null;
  crestUrl: string | null;
  description: string | null;
  createdBy: string;
}

export interface UpdateClubRequest {
  name: string;
  foundedYear: number | null;
  crestUrl: string | null;
  description: string | null;
}
