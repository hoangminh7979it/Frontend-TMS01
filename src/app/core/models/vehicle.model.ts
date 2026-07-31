export interface VehicleTypeModel {
  vehicleTypeId: number;
  vehicleTypeCode: string;
  vehicleTypeName: string;
  description?: string;
}

export interface VehicleTypeRequest {
  vehicleTypeCode: string;
  vehicleTypeName: string;
  description?: string;
}

export interface VehicleModel {
  id: number;
  vehicleCode?: string;
  name?: string;
  licensePlate: string;
  payloadCapacity?: number;
  status: string; // AVAILABLE, IN_TRANSIT, MAINTENANCE
  inspectionExpirationDate?: string;
  insuranceExpirationDate?: string;
  employeeId?: number;
  driverName?: string;
  driverPhone?: string;
  vehicleTypeId?: number;
  vehicleTypeCode?: string;
  vehicleTypeName?: string;
  createDate?: string;
}

export interface VehicleRequest {
  vehicleCode?: string;
  name?: string;
  licensePlate: string;
  payloadCapacity?: number;
  status?: string;
  inspectionExpirationDate?: string;
  insuranceExpirationDate?: string;
  employeeId?: number;
  vehicleTypeId?: number;
}
