import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SystemFeatureModel } from '@core/models/system-feature.model';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class SystemFeatureService {

  private apiUrl = 'http://localhost:8080/api/v1/system-features';


  constructor(private http: HttpClient) {}

  getAllFeatures(): Observable<ApiResponse<SystemFeatureModel[]>> {
    return this.http.get<ApiResponse<SystemFeatureModel[]>>(this.apiUrl);
  }

  getActiveFeatures(): Observable<ApiResponse<SystemFeatureModel[]>> {
    return this.http.get<ApiResponse<SystemFeatureModel[]>>(`${this.apiUrl}/active`);
  }

  getFeatureById(id: number): Observable<ApiResponse<SystemFeatureModel>> {
    return this.http.get<ApiResponse<SystemFeatureModel>>(`${this.apiUrl}/${id}`);
  }

  createFeature(request: SystemFeatureModel): Observable<ApiResponse<SystemFeatureModel>> {
    return this.http.post<ApiResponse<SystemFeatureModel>>(this.apiUrl, request);
  }

  updateFeature(id: number, request: SystemFeatureModel): Observable<ApiResponse<SystemFeatureModel>> {
    return this.http.put<ApiResponse<SystemFeatureModel>>(`${this.apiUrl}/${id}`, request);
  }

  deleteFeature(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  toggleActiveStatus(id: number): Observable<ApiResponse<SystemFeatureModel>> {
    return this.http.patch<ApiResponse<SystemFeatureModel>>(`${this.apiUrl}/${id}/toggle-active`, {});
  }
}
