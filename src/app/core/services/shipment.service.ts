import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { ShipmentModel, ShipmentRequest, StatusEnumModel, StatusEnumRequest } from '../models/shipment.model';

@Injectable({
  providedIn: 'root'
})
export class ShipmentService {

  private readonly SHIPMENTS_API = 'http://localhost:8080/api/v1/shipments';

  constructor(private http: HttpClient) {}

  public getAllShipments(): Observable<ApiResponse<ShipmentModel[]>> {
    return this.http.get<ApiResponse<ShipmentModel[]>>(this.SHIPMENTS_API);
  }

  public getShipmentById(id: number): Observable<ApiResponse<ShipmentModel>> {
    return this.http.get<ApiResponse<ShipmentModel>>(`${this.SHIPMENTS_API}/${id}`);
  }

  public createShipment(request: ShipmentRequest): Observable<ApiResponse<ShipmentModel>> {
    return this.http.post<ApiResponse<ShipmentModel>>(this.SHIPMENTS_API, request);
  }

  public updateShipment(id: number, request: ShipmentRequest): Observable<ApiResponse<ShipmentModel>> {
    return this.http.put<ApiResponse<ShipmentModel>>(`${this.SHIPMENTS_API}/${id}`, request);
  }

  public deleteShipment(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.SHIPMENTS_API}/${id}`);
  }

  public updateShipmentStatus(id: number, statusCode: string): Observable<ApiResponse<ShipmentModel>> {
    return this.http.patch<ApiResponse<ShipmentModel>>(`${this.SHIPMENTS_API}/${id}/status?statusCode=${statusCode}`, {});
  }

  public getShipmentsByStatusCode(statusCode: string): Observable<ApiResponse<ShipmentModel[]>> {
    return this.http.get<ApiResponse<ShipmentModel[]>>(`${this.SHIPMENTS_API}/status/${statusCode}`);
  }

  public getShipmentsByEmployee(
    employeeId: number,
    startDate?: string,
    endDate?: string
  ): Observable<ApiResponse<ShipmentModel[]>> {
    let params = `employeeId=${employeeId}`;
    if (startDate) params += `&startDate=${startDate}`;
    if (endDate) params += `&endDate=${endDate}`;
    return this.http.get<ApiResponse<ShipmentModel[]>>(`${this.SHIPMENTS_API}/by-employee?${params}`);
  }
  // --- STATUS ENUM APIS ---

  public getAllStatuses(): Observable<ApiResponse<StatusEnumModel[]>> {
    return this.http.get<ApiResponse<StatusEnumModel[]>>(`${this.SHIPMENTS_API}/statuses`);
  }

  public createStatus(request: StatusEnumRequest): Observable<ApiResponse<StatusEnumModel>> {
    return this.http.post<ApiResponse<StatusEnumModel>>(`${this.SHIPMENTS_API}/statuses`, request);
  }

  public updateStatus(id: number, request: StatusEnumRequest): Observable<ApiResponse<StatusEnumModel>> {
    return this.http.put<ApiResponse<StatusEnumModel>>(`${this.SHIPMENTS_API}/statuses/${id}`, request);
  }

  public deleteStatus(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.SHIPMENTS_API}/statuses/${id}`);
  }
}
