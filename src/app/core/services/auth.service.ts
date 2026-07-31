import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiResponse, LoginRequest, LoginResponse } from '../models/auth.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = 'http://localhost:8080/api/v1/auth';

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  public login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.storageService.saveToken(response.data.accessToken);
          this.storageService.saveUser(response.data);
        }
      })
    );
  }

  public logout(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/logout`, {}).pipe(
      tap(() => {
        this.storageService.clear();
      })
    );
  }

  public isLoggedIn(): boolean {
    return this.storageService.isLoggedIn();
  }

  public getCurrentUser(): any {
    return this.storageService.getUser();
  }
}
