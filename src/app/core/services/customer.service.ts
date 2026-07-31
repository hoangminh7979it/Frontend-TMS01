import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { CustomerModel, CustomerRequest, CompanyModel, CompanyRequest } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private readonly CUSTOMERS_API = 'http://localhost:8080/api/v1/customers';

  constructor(private http: HttpClient) {}

  public getAllCustomers(): Observable<ApiResponse<CustomerModel[]>> {
    return this.http.get<ApiResponse<CustomerModel[]>>(this.CUSTOMERS_API);
  }

  public getCustomerById(id: number): Observable<ApiResponse<CustomerModel>> {
    return this.http.get<ApiResponse<CustomerModel>>(`${this.CUSTOMERS_API}/${id}`);
  }

  public createCustomer(request: CustomerRequest): Observable<ApiResponse<CustomerModel>> {
    return this.http.post<ApiResponse<CustomerModel>>(this.CUSTOMERS_API, request);
  }

  public updateCustomer(id: number, request: CustomerRequest): Observable<ApiResponse<CustomerModel>> {
    return this.http.put<ApiResponse<CustomerModel>>(`${this.CUSTOMERS_API}/${id}`, request);
  }

  public deleteCustomer(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.CUSTOMERS_API}/${id}`);
  }

  public getCustomersByType(type: string): Observable<ApiResponse<CustomerModel[]>> {
    return this.http.get<ApiResponse<CustomerModel[]>>(`${this.CUSTOMERS_API}/type/${type}`);
  }

  // --- COMPANY APIS ---

  public getAllCompanies(): Observable<ApiResponse<CompanyModel[]>> {
    return this.http.get<ApiResponse<CompanyModel[]>>(`${this.CUSTOMERS_API}/companies`);
  }

  public createCompany(request: CompanyRequest): Observable<ApiResponse<CompanyModel>> {
    return this.http.post<ApiResponse<CompanyModel>>(`${this.CUSTOMERS_API}/companies`, request);
  }

  public updateCompany(id: number, request: CompanyRequest): Observable<ApiResponse<CompanyModel>> {
    return this.http.put<ApiResponse<CompanyModel>>(`${this.CUSTOMERS_API}/companies/${id}`, request);
  }

  public deleteCompany(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.CUSTOMERS_API}/companies/${id}`);
  }
}
