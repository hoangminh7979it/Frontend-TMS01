export interface CompanyModel {
  companyId: number;
  companyCode?: string;
  name: string;
  taxCode?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  customerId?: number;
  customerName?: string;
  createDate?: string;
}

export interface CompanyRequest {
  companyCode?: string;
  name: string;
  taxCode?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  customerId?: number;
}

export interface CustomerModel {
  customerId: number;
  customerCode: string;
  firstname: string;
  lastname?: string;
  fullName: string;
  companyName?: string;
  taxCode?: string;
  email?: string;
  phone?: string;
  address?: string;
  customerType: string; // CORPORATE, INDIVIDUAL
  notes?: string;
  createDate?: string;
}

export interface CustomerRequest {
  customerCode: string;
  firstname: string;
  lastname?: string;
  companyName?: string;
  taxCode?: string;
  email?: string;
  phone?: string;
  address?: string;
  customerType?: string;
  notes?: string;
}
