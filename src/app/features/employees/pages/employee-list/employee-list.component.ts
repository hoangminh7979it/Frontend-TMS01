import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { EmployeeService } from '@core/services/employee.service';
import { UserManagementService } from '@core/services/user-management.service';
import { EmployeeModel, EmployeeTypeModel } from '@core/models/employee.model';
import { UserModel } from '@core/models/user.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {

  activeTab: 'employees' | 'types' = 'employees';
  loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Data State
  employees: EmployeeModel[] = [];
  filteredEmployees: EmployeeModel[] = [];
  employeeTypes: EmployeeTypeModel[] = [];
  users: UserModel[] = [];

  // Filter State
  searchQuery: string = '';
  selectedTypeCode: string = 'ALL';

  // Employee Modal State
  showEmployeeModal: boolean = false;
  isEditEmployeeMode: boolean = false;
  selectedEmployee: EmployeeModel | null = null;
  employeeForm!: FormGroup;

  // Employee Type Modal State
  showTypeModal: boolean = false;
  isEditTypeMode: boolean = false;
  selectedType: EmployeeTypeModel | null = null;
  typeForm!: FormGroup;

  // KPI Metrics
  totalCount: number = 0;
  driverCount: number = 0;
  coDriverCount: number = 0;
  staffCount: number = 0;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private userService: UserManagementService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadEmployeeTypes();
    this.loadUsers();
    this.loadEmployees();
  }

  private initForms(): void {
    this.employeeForm = this.fb.group({
      employeeCode: ['', [Validators.required]],
      firstname: ['', [Validators.required]],
      lastname: [''],
      nationalId: [''],
      drivingLicenseId: [''],
      phone: [''],
      email: ['', [Validators.email]],
      address: [''],
      employeeTypeId: [null],
      userId: [null]
    });

    this.typeForm = this.fb.group({
      employeeTypeCode: ['', [Validators.required]],
      employeeTypeName: ['', [Validators.required]],
      description: ['']
    });
  }

  setActiveTab(tab: 'employees' | 'types'): void {
    this.activeTab = tab;
    this.clearAlerts();
  }

  clearAlerts(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }

  // --- DATA LOADING ---
  loadEmployeeTypes(): void {
    this.employeeService.getAllEmployeeTypes().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.employeeTypes = res.data;
        }
      }
    });
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.users = res.data;
        }
      }
    });
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService.getAllEmployees().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.employees = res.data;
          this.calculateMetrics();
          this.applyFilter();
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Không thể tải danh sách hồ sơ nhân sự.';
      }
    });
  }

  private calculateMetrics(): void {
    this.totalCount = this.employees.length;
    this.driverCount = this.employees.filter(e => e.employeeTypeCode === 'DRIVER').length;
    this.coDriverCount = this.employees.filter(e => e.employeeTypeCode === 'CO_DRIVER').length;
    this.staffCount = this.totalCount - (this.driverCount + this.coDriverCount);
  }

  applyFilter(): void {
    let result = [...this.employees];

    if (this.selectedTypeCode && this.selectedTypeCode !== 'ALL') {
      result = result.filter(e => e.employeeTypeCode === this.selectedTypeCode);
    }

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(e => 
        (e.employeeCode && e.employeeCode.toLowerCase().includes(q)) ||
        (e.fullName && e.fullName.toLowerCase().includes(q)) ||
        (e.phone && e.phone.toLowerCase().includes(q)) ||
        (e.nationalId && e.nationalId.toLowerCase().includes(q)) ||
        (e.drivingLicenseId && e.drivingLicenseId.toLowerCase().includes(q))
      );
    }

    this.filteredEmployees = result;
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  onTypeFilterChange(typeCode: string): void {
    this.selectedTypeCode = typeCode;
    this.applyFilter();
  }

  // --- EMPLOYEE MODAL HANDLERS ---
  openCreateEmployeeModal(): void {
    this.isEditEmployeeMode = false;
    this.selectedEmployee = null;
    this.employeeForm.reset();
    
    const nextNum = (this.employees.length + 1).toString().padStart(3, '0');
    this.employeeForm.patchValue({
      employeeCode: `NV-${nextNum}`
    });
    this.employeeForm.controls['employeeCode'].enable();
    this.showEmployeeModal = true;
  }

  openEditEmployeeModal(emp: EmployeeModel): void {
    this.isEditEmployeeMode = true;
    this.selectedEmployee = emp;
    this.employeeForm.patchValue({
      employeeCode: emp.employeeCode,
      firstname: emp.firstname,
      lastname: emp.lastname,
      nationalId: emp.nationalId,
      drivingLicenseId: emp.drivingLicenseId,
      phone: emp.phone,
      email: emp.email,
      address: emp.address,
      employeeTypeId: emp.employeeTypeId,
      userId: emp.userId
    });
    this.employeeForm.controls['employeeCode'].disable();
    this.showEmployeeModal = true;
  }

  closeEmployeeModal(): void {
    this.showEmployeeModal = false;
  }

  onSaveEmployee(): void {
    if (this.employeeForm.invalid) return;
    this.loading = true;
    const val = this.employeeForm.getRawValue();

    if (this.isEditEmployeeMode && this.selectedEmployee) {
      this.employeeService.updateEmployee(this.selectedEmployee.employeeId, val).subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Cập nhật hồ sơ nhân viên thành công';
          this.closeEmployeeModal();
          this.loadEmployees();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Cập nhật hồ sơ thất bại.';
        }
      });
    } else {
      this.employeeService.createEmployee(val).subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Tạo mới hồ sơ nhân viên thành công';
          this.closeEmployeeModal();
          this.loadEmployees();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Tạo hồ sơ nhân viên thất bại.';
        }
      });
    }
  }

  onDeleteEmployee(emp: EmployeeModel): void {
    if (!confirm(`Bạn có chắc chắn muốn xóa hồ sơ nhân viên "${emp.fullName}" (${emp.employeeCode})?`)) return;
    this.loading = true;
    this.employeeService.deleteEmployee(emp.employeeId).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Xóa hồ sơ nhân viên thành công';
        this.loadEmployees();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Xóa hồ sơ nhân viên thất bại.';
      }
    });
  }

  // --- EMPLOYEE TYPE MODAL HANDLERS ---
  openCreateTypeModal(): void {
    this.isEditTypeMode = false;
    this.selectedType = null;
    this.typeForm.reset();
    this.typeForm.controls['employeeTypeCode'].enable();
    this.showTypeModal = true;
  }

  openEditTypeModal(type: EmployeeTypeModel): void {
    this.isEditTypeMode = true;
    this.selectedType = type;
    this.typeForm.patchValue({
      employeeTypeCode: type.employeeTypeCode,
      employeeTypeName: type.employeeTypeName,
      description: type.description
    });
    this.typeForm.controls['employeeTypeCode'].disable();
    this.showTypeModal = true;
  }

  closeTypeModal(): void {
    this.showTypeModal = false;
  }

  onSaveType(): void {
    if (this.typeForm.invalid) return;
    this.loading = true;
    const val = this.typeForm.getRawValue();

    if (this.isEditTypeMode && this.selectedType) {
      this.employeeService.updateEmployeeType(this.selectedType.employeeTypeId, val).subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Cập nhật loại nhân viên thành công';
          this.closeTypeModal();
          this.loadEmployeeTypes();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Cập nhật loại nhân viên thất bại.';
        }
      });
    } else {
      this.employeeService.createEmployeeType(val).subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Tạo loại nhân viên mới thành công';
          this.closeTypeModal();
          this.loadEmployeeTypes();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Tạo loại nhân viên thất bại.';
        }
      });
    }
  }

  onDeleteType(type: EmployeeTypeModel): void {
    if (!confirm(`Bạn có chắc chắn muốn xóa loại nhân viên "${type.employeeTypeName}" (${type.employeeTypeCode})?`)) return;
    this.loading = true;
    this.employeeService.deleteEmployeeType(type.employeeTypeId).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Xóa loại nhân viên thành công';
        this.loadEmployeeTypes();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Xóa loại nhân viên thất bại.';
      }
    });
  }
}
