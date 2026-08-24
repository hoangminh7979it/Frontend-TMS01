import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReportFilterOptions {
  vehicleId?: number | null;
  employeeId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  format?: 'xlsx' | 'pdf';
}

@Injectable({
  providedIn: 'root'
})
export class ReportExportService {

  private baseUrl = 'http://localhost:8080/api/v1/reports';


  constructor(private http: HttpClient) {}

  exportShipments(options: ReportFilterOptions = {}): Observable<Blob> {
    const params = this.buildParams(options);
    return this.http.get(`${this.baseUrl}/shipments/export`, {
      params,
      responseType: 'blob'
    });
  }

  exportExpenses(options: ReportFilterOptions = {}): Observable<Blob> {
    const params = this.buildParams(options);
    return this.http.get(`${this.baseUrl}/expenses/export`, {
      params,
      responseType: 'blob'
    });
  }

  exportSalaries(options: ReportFilterOptions = {}): Observable<Blob> {
    const params = this.buildParams(options);
    return this.http.get(`${this.baseUrl}/salaries/export`, {
      params,
      responseType: 'blob'
    });
  }

  exportSalaryById(salaryId: number, templateFile?: File | null): Observable<Blob> {
    if (templateFile) {
      const formData = new FormData();
      formData.append('file', templateFile);
      return this.http.post(`${this.baseUrl}/salaries/${salaryId}/export`, formData, {
        responseType: 'blob'
      });
    }
    return this.http.get(`${this.baseUrl}/salaries/${salaryId}/export`, {
      responseType: 'blob'
    });
  }

  exportEmployeeSalaryById(salaryId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/salaries/${salaryId}/export-employee`, {
      responseType: 'blob'
    });
  }

  exportRevenues(options: ReportFilterOptions = {}): Observable<Blob> {
    const params = this.buildParams(options);
    return this.http.get(`${this.baseUrl}/revenues/export`, {
      params,
      responseType: 'blob'
    });
  }

  exportRevenueById(revenueId: number, templateFile?: File | null): Observable<Blob> {
    if (templateFile) {
      const formData = new FormData();
      formData.append('file', templateFile);
      return this.http.post(`${this.baseUrl}/revenues/${revenueId}/export`, formData, {
        responseType: 'blob'
      });
    }
    return this.http.get(`${this.baseUrl}/revenues/${revenueId}/export`, {
      responseType: 'blob'
    });
  }



  private buildParams(options: ReportFilterOptions): HttpParams {
    let params = new HttpParams().set('format', options.format || 'xlsx');
    if (options.vehicleId) params = params.set('vehicleId', options.vehicleId.toString());
    if (options.employeeId) params = params.set('employeeId', options.employeeId.toString());
    if (options.startDate) params = params.set('startDate', options.startDate);
    if (options.endDate) params = params.set('endDate', options.endDate);
    return params;
  }

  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
