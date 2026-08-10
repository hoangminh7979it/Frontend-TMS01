export interface StatusEnumModel {
  statusEnumId: number;
  statusEnumCode: string;
  statusEnumName: string;
  description?: string;
}

export interface StatusEnumRequest {
  statusEnumCode: string;
  statusEnumName: string;
  description?: string;
}

export interface ShipmentModel {
  shipmentId: number;
  shipmentCode: string;
  cargoType?: string;
  receiptPlace?: string;
  deliveryPlace?: string;
  weight?: number;
  dateOfReceipt?: string;
  deliveryDate?: string;
  revenue?: number;
  incurredCosts?: number;
  netProfit?: number;
  notes?: string;

  customerId?: number;
  customerName?: string;
  customerPhone?: string;

  vehicleId?: number;
  licensePlate?: string;
  vehicleName?: string;

  employeeId?: number;
  driverName?: string;
  driverPhone?: string;

  coDriverId?: number;
  coDriverName?: string;
  coDriverPhone?: string;

  statusEnumId?: number;

  statusEnumCode?: string;
  statusEnumName?: string;

  createDate?: string;
}

export interface ShipmentRequest {
  shipmentCode: string;
  cargoType?: string;
  receiptPlace?: string;
  deliveryPlace?: string;
  weight?: number;
  dateOfReceipt?: string;
  deliveryDate?: string;
  revenue?: number;
  incurredCosts?: number;
  notes?: string;
  customerId?: number;
  vehicleId?: number;
  employeeId?: number;
  coDriverId?: number;
  statusEnumId?: number;
}

