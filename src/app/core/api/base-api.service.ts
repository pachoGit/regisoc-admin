import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL } from '../config/api.tokens';

export abstract class BaseApiService {
  protected readonly http = inject(HttpClient);
  protected readonly baseUrl = inject(API_BASE_URL);

  protected url(path: string): string {
    const cleanBase = this.baseUrl.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  }
}
