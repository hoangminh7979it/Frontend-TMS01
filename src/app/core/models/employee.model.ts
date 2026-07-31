export interface EmployeeTypeModel {
  employeeTypeId: number;
  employeeTypeCode: string;
  employeeTypeName: string;
  description?: string;
}

export interface EmployeeTypeRequest {
  employeeTypeCode: string;
  employeeTypeName: string;
  description?: string;
}

export interface EmployeeModel {
  employeeId: number;
  employeeCode: string;
  firstname: string;
  lastname?: string;
  fullName: string;
  nationalId?: string;
  drivingLicenseId?: string;
  address?: string;
  email?: string;
  phone?: string;
  employeeTypeId?: number;
  employeeTypeCode?: string;
  employeeTypeName?: string;
  userId?: number;
  username?: string;
  createDate?: string;
}

export interface EmployeeRequest {
  employeeCode: string;
  firstname: string;
  lastname?: string;
  nationalId?: string;
  drivingLicenseId?: string;
  address?: string;
  email?: string;
  phone?: string;
  employeeTypeId?: number;
  userId?: number;
}
