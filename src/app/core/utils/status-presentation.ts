import { UserRole } from '../models/auth.model';
import { EventStatus } from '../models/event.model';
import { LineupStatus } from '../models/lineup.model';
import { MatchDateStatus, MatchStatus } from '../models/match.model';
import { PlayerPosition } from '../models/roster.model';

export type BadgeTone = 'slate' | 'emerald' | 'sky' | 'amber' | 'rose' | 'indigo';

export interface StatusPresentation {
  label: string;
  tone: BadgeTone;
  dot?: boolean;
}

export type DomainStatusKey =
  | EventStatus
  | MatchDateStatus
  | MatchStatus
  | LineupStatus
  | UserRole
  | PlayerPosition
  | 'ACTIVE'
  | 'INACTIVE';

const STATUS_REGISTRY: Record<DomainStatusKey, StatusPresentation> = {
  // Event / MatchDate / Match lifecycle
  UPCOMING: { label: 'Programado', tone: 'sky', dot: true },
  ONGOING: { label: 'En curso', tone: 'amber', dot: true },
  FINISHED: { label: 'Finalizado', tone: 'emerald', dot: true },
  CANCELED: { label: 'Cancelado', tone: 'rose', dot: true },

  // Lineup status
  OPEN: { label: 'Abierta', tone: 'sky', dot: true },
  CLOSE: { label: 'Cerrada', tone: 'emerald', dot: true },

  // User roles
  ADMIN: { label: 'Administrador', tone: 'indigo' },
  CLUB_MANAGER: { label: 'Gestor de Club', tone: 'emerald' },

  // Player positions
  GOALKEEPER: { label: 'Portero', tone: 'amber' },
  DEFENDER: { label: 'Defensa', tone: 'sky' },
  MIDFIELDER: { label: 'Mediocampista', tone: 'emerald' },
  FORWARD: { label: 'Delantero', tone: 'rose' },

  // Generic active flags
  ACTIVE: { label: 'Activo', tone: 'emerald', dot: true },
  INACTIVE: { label: 'Inactivo', tone: 'slate', dot: true },
};

export function getStatusPresentation(key: string | null | undefined): StatusPresentation {
  if (!key) {
    return { label: 'Sin definir', tone: 'slate' };
  }
  return STATUS_REGISTRY[key as DomainStatusKey] ?? { label: key, tone: 'slate' };
}

export const BADGE_TONE_CLASSES: Record<BadgeTone, { container: string; dot: string }> = {
  slate: {
    container: 'bg-slate-100 text-slate-700 ring-slate-300/60',
    dot: 'bg-slate-500',
  },
  emerald: {
    container: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    dot: 'bg-emerald-500',
  },
  sky: {
    container: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    dot: 'bg-sky-500',
  },
  amber: {
    container: 'bg-amber-50 text-amber-800 ring-amber-600/25',
    dot: 'bg-amber-500',
  },
  rose: {
    container: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    dot: 'bg-rose-500',
  },
  indigo: {
    container: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    dot: 'bg-indigo-500',
  },
};
