import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { VehicleModel, VehicleRequest, VehicleTypeModel, VehicleTypeRequest } from '../models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  private readonly VEHICLES_API = 'http://localhost:8080/api/v1/vehicles';

  constructor(private http: HttpClient) {}

  public getAllVehicles(): Observable<ApiResponse<VehicleModel[]>> {
    return this.http.get<ApiResponse<VehicleModel[]>>(this.VEHICLES_API);
  }

  public getVehicleById(id: number): Observable<ApiResponse<VehicleModel>> {
    return this.http.get<ApiResponse<VehicleModel>>(`${this.VEHICLES_API}/${id}`);
  }

  public createVehicle(request: VehicleRequest): Observable<ApiResponse<VehicleModel>> {
    return this.http.post<ApiResponse<VehicleModel>>(this.VEHICLES_API, request);
  }

  public updateVehicle(id: number, request: VehicleRequest): Observable<ApiResponse<VehicleModel>> {
    return this.http.put<ApiResponse<VehicleModel>>(`${this.VEHICLES_API}/${id}`, request);
  }

  public deleteVehicle(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.VEHICLES_API}/${id}`);
  }

  public getVehiclesByStatus(status: string): Observable<ApiResponse<VehicleModel[]>> {
    return this.http.get<ApiResponse<VehicleModel[]>>(`${this.VEHICLES_API}/status/${status}`);
  }

  // --- VEHICLE TYPE APIS ---

  public getAllVehicleTypes(): Observable<ApiResponse<VehicleTypeModel[]>> {
    return this.http.get<ApiResponse<VehicleTypeModel[]>>(`${this.VEHICLES_API}/types`);
  }

  public createVehicleType(request: VehicleTypeRequest): Observable<ApiResponse<VehicleTypeModel>> {
    return this.http.post<ApiResponse<VehicleTypeModel>>(`${this.VEHICLES_API}/types`, request);
  }

  public updateVehicleType(id: number, request: VehicleTypeRequest): Observable<ApiResponse<VehicleTypeModel>> {
    return this.http.put<ApiResponse<VehicleTypeModel>>(`${this.VEHICLES_API}/types/${id}`, request);
  }

  public deleteVehicleType(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.VEHICLES_API}/types/${id}`);
  }
}
