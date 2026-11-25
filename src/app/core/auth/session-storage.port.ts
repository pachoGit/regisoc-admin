import { Injectable } from '@angular/core';
import { AuthSession } from '../models/auth.model';

export abstract class SessionStoragePort {
  abstract read(): AuthSession | null;
  abstract write(session: AuthSession): void;
  abstract clear(): void;
}

const SESSION_KEY = 'regisoc_admin_session';

@Injectable({ providedIn: 'root' })
export class BrowserSessionStorage extends SessionStoragePort {
  read(): AuthSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  }

  write(session: AuthSession): void {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // Ignore storage quota errors in private mode
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore
    }
  }
}
