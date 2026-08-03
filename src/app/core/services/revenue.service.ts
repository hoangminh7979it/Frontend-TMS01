import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@core/models/auth.model';
import { RevenueFinalModel, RevenueSummaryModel, RevenueFinalRequest } from '@core/models/revenue.model';

@Injectable({
  providedIn: 'root'
})
export class RevenueService {

  private baseUrl = 'http://localhost:8080/api/v1/revenues';

  constructor(private http: HttpClient) {}

  getRevenueSummary(): Observable<ApiResponse<RevenueSummaryModel>> {
    return this.http.get<ApiResponse<RevenueSummaryModel>>(`${this.baseUrl}/summary`);
  }

  getAllRevenues(): Observable<ApiResponse<RevenueFinalModel[]>> {
    return this.http.get<ApiResponse<RevenueFinalModel[]>>(`${this.baseUrl}`);
  }

  getRevenueById(id: number): Observable<ApiResponse<RevenueFinalModel>> {
    return this.http.get<ApiResponse<RevenueFinalModel>>(`${this.baseUrl}/${id}`);
  }

  createRevenue(request: RevenueFinalRequest): Observable<ApiResponse<RevenueFinalModel>> {
    return this.http.post<ApiResponse<RevenueFinalModel>>(`${this.baseUrl}`, request);
  }

  updateRevenue(id: number, request: RevenueFinalRequest): Observable<ApiResponse<RevenueFinalModel>> {
    return this.http.put<ApiResponse<RevenueFinalModel>>(`${this.baseUrl}/${id}`, request);
  }

  deleteRevenue(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }
}
