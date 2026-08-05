import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CustomerService } from '@core/services/customer.service';
import { ConfirmDialogService } from '@core/services/confirm-dialog.service';
import { CustomerFormComponent } from '../customer-form/customer-form.component';
import { CustomerModel, CompanyModel } from '@core/models/customer.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CustomerFormComponent],
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {

  activeTab: 'customers' | 'companies' = 'customers';
  loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Data State
  customers: CustomerModel[] = [];
  filteredCustomers: CustomerModel[] = [];
  companies: CompanyModel[] = [];

  // Filter State
  searchQuery: string = '';
  selectedType: string = 'ALL';

  // Customer Modal State
  showCustomerModal: boolean = false;
  isEditCustomerMode: boolean = false;
  selectedCustomer: CustomerModel | null = null;
  customerForm!: FormGroup;

  // Company Modal State
  showCompanyModal: boolean = false;
  isEditCompanyMode: boolean = false;
  selectedCompany: CompanyModel | null = null;
  companyForm!: FormGroup;

  // KPI Metrics
  totalCount: number = 0;
  corporateCount: number = 0;
  individualCount: number = 0;
  companyCount: number = 0;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadCompanies();
    this.loadCustomers();
  }

  private initForms(): void {
    this.customerForm = this.fb.group({
      customerCode: ['', [Validators.required]],
      firstname: ['', [Validators.required]],
      lastname: [''],
      companyName: [''],
      taxCode: [''],
      phone: [''],
      email: ['', [Validators.email]],
      address: [''],
      customerType: ['CORPORATE', [Validators.required]],
      notes: ['']
    });

    this.companyForm = this.fb.group({
      companyCode: [''],
      name: ['', [Validators.required]],
      taxCode: [''],
      contactPerson: [''],
      phone: [''],
      email: ['', [Validators.email]],
      address: [''],
      customerId: [null]
    });
  }

  setActiveTab(tab: 'customers' | 'companies'): void {
    this.activeTab = tab;
    this.clearAlerts();
  }

  clearAlerts(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }

  showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => { this.successMessage = null; }, 1790);
  }

  showError(msg: string): void {
    this.errorMessage = msg;
    setTimeout(() => { this.errorMessage = null; }, 1790);
  }

  // --- DATA LOADING ---
  loadCompanies(): void {
    this.customerService.getAllCompanies().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.companies = res.data;
          this.companyCount = this.companies.length;
        }
      }
    });
  }

  loadCustomers(): void {
    this.loading = true;
    this.customerService.getAllCustomers().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.customers = res.data;
          this.calculateMetrics();
          this.applyFilter();
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Không thể tải danh sách hồ sơ khách hàng từ máy chủ.';
      }
    });
  }

  private calculateMetrics(): void {
    this.totalCount = this.customers.length;
    this.corporateCount = this.customers.filter(c => c.customerType === 'CORPORATE').length;
    this.individualCount = this.customers.filter(c => c.customerType === 'INDIVIDUAL').length;
  }

  applyFilter(): void {
    let result = [...this.customers];

    if (this.selectedType && this.selectedType !== 'ALL') {
      result = result.filter(c => c.customerType === this.selectedType);
    }

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(c => 
        (c.customerCode && c.customerCode.toLowerCase().includes(q)) ||
        (c.fullName && c.fullName.toLowerCase().includes(q)) ||
        (c.companyName && c.companyName.toLowerCase().includes(q)) ||
        (c.taxCode && c.taxCode.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
      );
    }

    this.filteredCustomers = result;
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  onTypeFilterChange(type: string): void {
    this.selectedType = type;
    this.applyFilter();
  }

  // --- CUSTOMER MODAL HANDLERS ---
  openCreateCustomerModal(): void {
    this.clearAlerts();
    this.isEditCustomerMode = false;
    this.selectedCustomer = null;
    this.customerForm.reset({ customerType: 'CORPORATE' });
    
    const nextNum = (this.customers.length + 1).toString().padStart(3, '0');
    this.customerForm.patchValue({
      customerCode: `KH-${nextNum}`
    });
    this.customerForm.controls['customerCode'].enable();
    this.showCustomerModal = true;
  }

  openEditCustomerModal(c: CustomerModel): void {
    this.clearAlerts();
    this.isEditCustomerMode = true;
    this.selectedCustomer = c;
    this.customerForm.patchValue({
      customerCode: c.customerCode,
      firstname: c.firstname,
      lastname: c.lastname,
      companyName: c.companyName,
      taxCode: c.taxCode,
      phone: c.phone,
      email: c.email,
      address: c.address,
      customerType: c.customerType || 'CORPORATE',
      notes: c.notes
    });
    this.customerForm.controls['customerCode'].disable();
    this.showCustomerModal = true;
  }

  closeCustomerModal(): void {
    this.showCustomerModal = false;
  }

  onSaveCustomer(): void {
    this.clearAlerts();
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      this.errorMessage = 'Vui lòng kiểm tra và nhập đầy đủ các trường bắt buộc (*) như Mã KH, Họ và Tên đại diện!';
      return;
    }

    this.loading = true;
    const val = this.customerForm.getRawValue();

    if (this.isEditCustomerMode && this.selectedCustomer) {
      this.customerService.updateCustomer(this.selectedCustomer.customerId, val).subscribe({
        next: (res) => {
          this.loading = false;
          this.showSuccess(res.message || 'Thao tác thành công');
          this.closeCustomerModal();
          this.loadCustomers();
        },
        error: (err) => {
          this.loading = false;
          this.showError(err.error?.message || 'Thao tác thất bại');
        }
      });
    } else {
      this.customerService.createCustomer(val).subscribe({
        next: (res) => {
          this.loading = false;
          this.showSuccess(res.message || 'Thao tác thành công');
          this.closeCustomerModal();
          this.loadCustomers();
        },
        error: (err) => {
          this.loading = false;
          this.showError(err.error?.message || 'Thao tác thất bại');
        }
      });
    }
  }

  onDeleteCustomer(c: CustomerModel): void {
    this.clearAlerts();
    this.confirmDialog.confirm({
      title: 'Xóa Hồ Sơ Khách Hàng',
      message: `Bạn có chắc chắn muốn xóa hồ sơ khách hàng "${c.companyName || c.fullName}" (${c.customerCode})?`,
      confirmText: 'Đồng Ý Xóa',
      cancelText: 'Hủy Bỏ',
      type: 'danger',
      onConfirm: () => {
        this.loading = true;
        this.customerService.deleteCustomer(c.customerId).subscribe({
          next: (res) => {
            this.loading = false;
            this.showSuccess(res.message || 'Thao tác thành công');
            this.loadCustomers();
          },
          error: (err) => {
            this.loading = false;
            this.showError(err.error?.message || 'Thao tác thất bại');
          }
        });
      }
    });
  }

  // --- COMPANY MODAL HANDLERS ---
  openCreateCompanyModal(): void {
    this.clearAlerts();
    this.isEditCompanyMode = false;
    this.selectedCompany = null;
    this.companyForm.reset();
    
    const nextNum = (this.companies.length + 1).toString().padStart(3, '0');
    this.companyForm.patchValue({
      companyCode: `CTY-${nextNum}`
    });
    this.showCompanyModal = true;
  }

  openEditCompanyModal(comp: CompanyModel): void {
    this.clearAlerts();
    this.isEditCompanyMode = true;
    this.selectedCompany = comp;
    this.companyForm.patchValue({
      companyCode: comp.companyCode,
      name: comp.name,
      taxCode: comp.taxCode,
      contactPerson: comp.contactPerson,
      phone: comp.phone,
      email: comp.email,
      address: comp.address,
      customerId: comp.customerId
    });
    this.showCompanyModal = true;
  }

  closeCompanyModal(): void {
    this.showCompanyModal = false;
  }

  onSaveCompany(): void {
    this.clearAlerts();
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      this.errorMessage = 'Vui lòng kiểm tra và nhập Tên công ty đối tác (*) !';
      return;
    }

    this.loading = true;
    const val = this.companyForm.getRawValue();

    if (this.isEditCompanyMode && this.selectedCompany) {
      this.customerService.updateCompany(this.selectedCompany.companyId, val).subscribe({
        next: (res) => {
          this.loading = false;
          this.successMessage = res.message || 'Cập nhật công ty đối tác thành công';
          this.closeCompanyModal();
          this.loadCompanies();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Cập nhật công ty thất bại.';
        }
      });
    } else {
      this.customerService.createCompany(val).subscribe({
        next: (res) => {
          this.loading = false;
          this.successMessage = res.message || 'Tạo công ty đối tác mới thành công';
          this.closeCompanyModal();
          this.loadCompanies();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Khai báo công ty thất bại.';
        }
      });
    }
  }

  onDeleteCompany(comp: CompanyModel): void {
    this.clearAlerts();
    this.confirmDialog.confirm({
      title: 'Xóa Công Ty Đối Tác',
      message: `Bạn có chắc chắn muốn xóa công ty đối tác "${comp.name}"?`,
      confirmText: 'Đồng Ý Xóa',
      cancelText: 'Hủy Bỏ',
      type: 'danger',
      onConfirm: () => {
        this.loading = true;
        this.customerService.deleteCompany(comp.companyId).subscribe({
          next: (res) => {
            this.loading = false;
            this.showSuccess(res.message || 'Thao tác thành công');
            this.loadCompanies();
          },
          error: (err) => {
            this.loading = false;
            this.showError(err.error?.message || 'Thao tác thất bại');
          }
        });
      }
    });
  }
}
