import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@core/models/auth.model';
import { SalaryModel, SalaryRequest } from '@core/models/payroll.model';

@Injectable({
  providedIn: 'root'
})
export class PayrollService {

  private baseUrl = 'http://localhost:8080/api/v1/salaries';

  constructor(private http: HttpClient) {}

  getAllSalaries(): Observable<ApiResponse<SalaryModel[]>> {
    return this.http.get<ApiResponse<SalaryModel[]>>(`${this.baseUrl}`);
  }

  getSalaryById(id: number): Observable<ApiResponse<SalaryModel>> {
    return this.http.get<ApiResponse<SalaryModel>>(`${this.baseUrl}/${id}`);
  }

  createSalary(request: SalaryRequest): Observable<ApiResponse<SalaryModel>> {
    return this.http.post<ApiResponse<SalaryModel>>(`${this.baseUrl}`, request);
  }

  updateSalary(id: number, request: SalaryRequest): Observable<ApiResponse<SalaryModel>> {
    return this.http.put<ApiResponse<SalaryModel>>(`${this.baseUrl}/${id}`, request);
  }

  deleteSalary(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }
}
