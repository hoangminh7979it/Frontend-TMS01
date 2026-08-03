export interface SalaryModel {
  salaryId: number;
  salaryCode: string;
  employeeId?: number;
  employeeCode?: string;
  employeeName?: string;
  employeeTypeName?: string;
  drivingLicenseId?: string;
  vehicleId?: number;
  licensePlates?: string[];
  salaryBasicCosts?: number;
  workDaysCount?: number;
  salaryBasicPerDay?: number;
  startDate?: string;
  endDate?: string;
  totalShipmentCount?: number;
  driverShipmentRevenue?: number;
  tripSalaryPercentage?: number;
  totalSalaryPerShipment?: number;
  allowanceCosts?: number;
  deductionCosts?: number;
  salaryCosts?: number;
  notes?: string;
  createDate?: string;
  shipmentCodes?: string[];
}

export interface SalaryRequest {
  salaryCode: string;
  employeeId?: number;
  vehicleIds?: number[];
  startDate?: string;
  endDate?: string;
  workDaysCount?: number;
  salaryBasicPerDay?: number;
  totalShipmentCount?: number;
  driverShipmentRevenue?: number;
  tripSalaryPercentage?: number;
  salaryBasicCosts?: number;
  totalSalaryPerShipment?: number;
  allowanceCosts?: number;
  deductionCosts?: number;
  salaryCosts?: number;
  notes?: string;
  shipmentIds?: number[];
}
