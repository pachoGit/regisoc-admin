import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateUserRequest, User } from '../models/user.model';
import { BaseApiService } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class UserApi extends BaseApiService {
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.url('/users'));
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(this.url(`/users/${id}`));
  }

  create(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.url('/users'), request);
  }
}
