import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { UserModel } from '../models/user.model';

export interface UserCreateRequest {
  username: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  roleId?: number;
  workStartTime?: string;
  workEndTime?: string;
}

export interface UserUpdateRequest {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  roleId?: number;
  isActive?: boolean;
  workStartTime?: string;
  workEndTime?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  private readonly USERS_API = 'http://localhost:8080/api/v1/users';

  constructor(private http: HttpClient) {}

  public getAllUsers(): Observable<ApiResponse<UserModel[]>> {
    return this.http.get<ApiResponse<UserModel[]>>(this.USERS_API);
  }

  public getUserById(id: number): Observable<ApiResponse<UserModel>> {
    return this.http.get<ApiResponse<UserModel>>(`${this.USERS_API}/${id}`);
  }

  public createUser(request: UserCreateRequest): Observable<ApiResponse<UserModel>> {
    return this.http.post<ApiResponse<UserModel>>(this.USERS_API, request);
  }

  public updateUser(id: number, request: UserUpdateRequest): Observable<ApiResponse<UserModel>> {
    return this.http.put<ApiResponse<UserModel>>(`${this.USERS_API}/${id}`, request);
  }

  public deleteUser(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.USERS_API}/${id}`);
  }

  public resetPassword(userId: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.USERS_API}/reset-password`, { userId });
  }
}
