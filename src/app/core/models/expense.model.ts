export interface ExpenseTypeModel {
  expenseTypeId: number;
  expenseTypeCode: string;
  expenseTypeName: string;
  description?: string;
}

export interface ExpenseTypeRequest {
  expenseTypeCode: string;
  expenseTypeName: string;
  description?: string;
}

export interface ExpenseDetailModel {
  expenseDetailId?: number;
  expenseDetailCode?: string;
  expenseTypeId?: number;
  expenseTypeCode?: string;
  expenseTypeName?: string;
  expenseDetailCosts?: number;
  description?: string;
  date?: string;
}

export interface ExpenseDetailRequest {
  expenseDetailCode?: string;
  expenseTypeId?: number;
  expenseTypeCode?: string;
  expenseDetailCosts?: number;
  description?: string;
  date?: string;
}

export interface ExpenseModel {
  expenseId: number;
  expenseCode: string;
  title?: string;
  expenseDate?: string;
  totalExpense?: number;
  vehicleLicensePlate?: string;
  vehicleId?: number;
  vehicleName?: string;
  shipmentId?: number;
  shipmentCode?: string;
  employeeId?: number;
  employeeName?: string;
  statusEnumId?: number;
  statusEnumCode?: string;
  statusEnumName?: string;
  notes?: string;
  createDate?: string;
  details?: ExpenseDetailModel[];
}

export interface ExpenseRequest {
  expenseCode: string;
  title?: string;
  expenseDate?: string;
  totalExpense?: number;
  vehicleLicensePlate?: string;
  vehicleId?: number;
  shipmentId?: number;
  employeeId?: number;
  statusEnumId?: number;
  notes?: string;
  details?: ExpenseDetailRequest[];
}
