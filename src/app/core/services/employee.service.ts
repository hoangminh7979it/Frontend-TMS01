import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { EmployeeModel, EmployeeRequest, EmployeeTypeModel, EmployeeTypeRequest } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private readonly EMPLOYEES_API = 'http://localhost:8080/api/v1/employees';

  constructor(private http: HttpClient) {}

  public getAllEmployees(): Observable<ApiResponse<EmployeeModel[]>> {
    return this.http.get<ApiResponse<EmployeeModel[]>>(this.EMPLOYEES_API);
  }

  public getEmployeeById(id: number): Observable<ApiResponse<EmployeeModel>> {
    return this.http.get<ApiResponse<EmployeeModel>>(`${this.EMPLOYEES_API}/${id}`);
  }

  public createEmployee(request: EmployeeRequest): Observable<ApiResponse<EmployeeModel>> {
    return this.http.post<ApiResponse<EmployeeModel>>(this.EMPLOYEES_API, request);
  }

  public updateEmployee(id: number, request: EmployeeRequest): Observable<ApiResponse<EmployeeModel>> {
    return this.http.put<ApiResponse<EmployeeModel>>(`${this.EMPLOYEES_API}/${id}`, request);
  }

  public deleteEmployee(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.EMPLOYEES_API}/${id}`);
  }

  // --- EMPLOYEE TYPE APIS ---

  public getAllEmployeeTypes(): Observable<ApiResponse<EmployeeTypeModel[]>> {
    return this.http.get<ApiResponse<EmployeeTypeModel[]>>(`${this.EMPLOYEES_API}/types`);
  }

  public createEmployeeType(request: EmployeeTypeRequest): Observable<ApiResponse<EmployeeTypeModel>> {
    return this.http.post<ApiResponse<EmployeeTypeModel>>(`${this.EMPLOYEES_API}/types`, request);
  }

  public updateEmployeeType(id: number, request: EmployeeTypeRequest): Observable<ApiResponse<EmployeeTypeModel>> {
    return this.http.put<ApiResponse<EmployeeTypeModel>>(`${this.EMPLOYEES_API}/types/${id}`, request);
  }

  public deleteEmployeeType(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.EMPLOYEES_API}/types/${id}`);
  }

  public getEmployeesByTypeCode(typeCode: string): Observable<ApiResponse<EmployeeModel[]>> {
    return this.http.get<ApiResponse<EmployeeModel[]>>(`${this.EMPLOYEES_API}/type/${typeCode}`);
  }
}
