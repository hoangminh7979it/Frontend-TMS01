export interface RevenueFinalModel {
  revenueId: number;
  revenueCode: string;
  title?: string;
  vehicleId?: number;
  licensePlate?: string;
  vehicleName?: string;
  startDate?: string;
  endDate?: string;
  totalShipment?: number;
  grossRevenue?: number;
  totalExpense?: number;
  totalSalary?: number;
  revenueFinalCosts?: number; // Lợi nhuận ròng
  notes?: string;
  createDate?: string;
  shipmentCodes?: string[];
}

export interface RevenueSummaryModel {
  totalGrossRevenue: number;
  totalExpenses: number;
  totalSalariesPaid: number;
  netProfit: number;
  totalShipmentsCompleted: number;
  activeDriversCount: number;
}

export interface RevenueFinalRequest {
  revenueCode: string;
  title?: string;
  vehicleId?: number;
  startDate?: string;
  endDate?: string;
  totalShipment?: number;
  grossRevenue?: number;
  totalExpense?: number;
  totalSalary?: number;
  revenueFinalCosts?: number;
  notes?: string;
  shipmentIds?: number[];
}
