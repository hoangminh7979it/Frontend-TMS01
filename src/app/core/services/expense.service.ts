import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { ExpenseModel, ExpenseRequest, ExpenseTypeModel, ExpenseTypeRequest } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private readonly EXPENSES_API = 'http://localhost:8080/api/v1/expenses';

  constructor(private http: HttpClient) {}

  public getAllExpenses(): Observable<ApiResponse<ExpenseModel[]>> {
    return this.http.get<ApiResponse<ExpenseModel[]>>(this.EXPENSES_API);
  }

  public getExpenseById(id: number): Observable<ApiResponse<ExpenseModel>> {
    return this.http.get<ApiResponse<ExpenseModel>>(`${this.EXPENSES_API}/${id}`);
  }

  public createExpense(request: ExpenseRequest): Observable<ApiResponse<ExpenseModel>> {
    return this.http.post<ApiResponse<ExpenseModel>>(this.EXPENSES_API, request);
  }

  public updateExpense(id: number, request: ExpenseRequest): Observable<ApiResponse<ExpenseModel>> {
    return this.http.put<ApiResponse<ExpenseModel>>(`${this.EXPENSES_API}/${id}`, request);
  }

  public deleteExpense(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.EXPENSES_API}/${id}`);
  }

  // --- EXPENSE TYPES APIS ---

  public getAllExpenseTypes(): Observable<ApiResponse<ExpenseTypeModel[]>> {
    return this.http.get<ApiResponse<ExpenseTypeModel[]>>(`${this.EXPENSES_API}/types`);
  }

  public createExpenseType(request: ExpenseTypeRequest): Observable<ApiResponse<ExpenseTypeModel>> {
    return this.http.post<ApiResponse<ExpenseTypeModel>>(`${this.EXPENSES_API}/types`, request);
  }

  public updateExpenseType(id: number, request: ExpenseTypeRequest): Observable<ApiResponse<ExpenseTypeModel>> {
    return this.http.put<ApiResponse<ExpenseTypeModel>>(`${this.EXPENSES_API}/types/${id}`, request);
  }

  public deleteExpenseType(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.EXPENSES_API}/types/${id}`);
  }
}
