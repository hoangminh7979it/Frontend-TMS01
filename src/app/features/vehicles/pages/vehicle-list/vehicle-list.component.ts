import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { VehicleService } from '@core/services/vehicle.service';
import { EmployeeService } from '@core/services/employee.service';
import { ConfirmDialogService } from '@core/services/confirm-dialog.service';
import { VehicleFormComponent } from '../vehicle-form/vehicle-form.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { VehicleModel, VehicleTypeModel } from '@core/models/vehicle.model';
import { EmployeeModel } from '@core/models/employee.model';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, VehicleFormComponent, PaginationComponent],
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.css']
})

export class VehicleListComponent implements OnInit {

  activeTab: 'vehicles' | 'types' = 'vehicles';
  loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Data State
  vehicles: VehicleModel[] = [];
  filteredVehicles: VehicleModel[] = [];
  vehicleTypes: VehicleTypeModel[] = [];
  drivers: EmployeeModel[] = [];

  // Filter State
  searchQuery: string = '';
  selectedStatus: string = 'ALL';
  selectedTypeCode: string = 'ALL';

  // Pagination State
  paginatedVehicles: VehicleModel[] = [];
  currentPage: number = 1;
  pageSize: number = 10;


  // Vehicle Modal State
  showVehicleModal: boolean = false;
  isEditVehicleMode: boolean = false;
  selectedVehicle: VehicleModel | null = null;
  vehicleForm!: FormGroup;

  // Vehicle Type Modal State
  showTypeModal: boolean = false;
  isEditTypeMode: boolean = false;
  selectedType: VehicleTypeModel | null = null;
  typeForm!: FormGroup;

  // KPI Metrics
  totalCount: number = 0;
  availableCount: number = 0;
  inTransitCount: number = 0;
  maintenanceCount: number = 0;
  expiringInspectionCount: number = 0;

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private employeeService: EmployeeService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadVehicleTypes();
    this.loadDrivers();
    this.loadVehicles();
  }

  private initForms(): void {
    this.vehicleForm = this.fb.group({
      vehicleCode: [''],
      name: [''],
      licensePlate: ['', [Validators.required]],
      payloadCapacity: [null, [Validators.min(0)]],
      status: ['AVAILABLE', [Validators.required]],
      inspectionExpirationDate: [''],
      insuranceExpirationDate: [''],
      employeeId: [null],
      vehicleTypeId: [null]
    });

    this.typeForm = this.fb.group({
      vehicleTypeCode: ['', [Validators.required]],
      vehicleTypeName: ['', [Validators.required]],
      description: ['']
    });
  }

  setActiveTab(tab: 'vehicles' | 'types'): void {
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
  loadVehicleTypes(): void {
    this.vehicleService.getAllVehicleTypes().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.vehicleTypes = res.data;
        }
      }
    });
  }

  loadDrivers(): void {
    this.employeeService.getEmployeesByTypeCode('DRIVER').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.drivers = res.data;
        }
      },
      error: () => {
        // Fallback: load all employees if driver type code filter returns empty
        this.employeeService.getAllEmployees().subscribe({
          next: (resAll) => {
            if (resAll.success && resAll.data) {
              this.drivers = resAll.data;
            }
          }
        });
      }
    });
  }

  loadVehicles(): void {
    this.loading = true;
    this.vehicleService.getAllVehicles().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.vehicles = res.data;
          this.calculateMetrics();
          this.applyFilter();
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Không thể tải danh sách hồ sơ phương tiện.';
      }
    });
  }

  private calculateMetrics(): void {
    this.totalCount = this.vehicles.length;
    this.availableCount = this.vehicles.filter(v => v.status === 'AVAILABLE').length;
    this.inTransitCount = this.vehicles.filter(v => v.status === 'IN_TRANSIT').length;
    this.maintenanceCount = this.vehicles.filter(v => v.status === 'MAINTENANCE').length;

    // Check inspection expiration within 30 days
    const now = new Date();
    const future30 = new Date();
    future30.setDate(now.getDate() + 30);

    this.expiringInspectionCount = this.vehicles.filter(v => {
      if (!v.inspectionExpirationDate) return false;
      const expDate = new Date(v.inspectionExpirationDate);
      return expDate <= future30;
    }).length;
  }

  isInspectionExpiringSoon(dateStr?: string): boolean {
    if (!dateStr) return false;
    const now = new Date();
    const future30 = new Date();
    future30.setDate(now.getDate() + 30);
    const expDate = new Date(dateStr);
    return expDate <= future30;
  }

  applyFilter(): void {
    let result = [...this.vehicles];

    if (this.selectedStatus && this.selectedStatus !== 'ALL') {
      result = result.filter(v => v.status === this.selectedStatus);
    }

    if (this.selectedTypeCode && this.selectedTypeCode !== 'ALL') {
      result = result.filter(v => v.vehicleTypeCode === this.selectedTypeCode);
    }

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(v => 
        (v.licensePlate && v.licensePlate.toLowerCase().includes(q)) ||
        (v.vehicleCode && v.vehicleCode.toLowerCase().includes(q)) ||
        (v.name && v.name.toLowerCase().includes(q)) ||
        (v.driverName && v.driverName.toLowerCase().includes(q))
      );
    }

    this.filteredVehicles = result;
    this.currentPage = 1;
    this.updatePaginatedVehicles();
  }

  updatePaginatedVehicles(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedVehicles = this.filteredVehicles.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedVehicles();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updatePaginatedVehicles();
  }


  onSearchChange(): void {
    this.applyFilter();
  }

  onStatusFilterChange(status: string): void {
    this.selectedStatus = status;
    this.applyFilter();
  }

  onTypeFilterChange(typeCode: string): void {
    this.selectedTypeCode = typeCode;
    this.applyFilter();
  }

  // --- VEHICLE MODAL HANDLERS ---
  openCreateVehicleModal(): void {
    this.isEditVehicleMode = false;
    this.selectedVehicle = null;
    this.vehicleForm.reset({ status: 'AVAILABLE' });
    
    const nextNum = (this.vehicles.length + 1).toString().padStart(3, '0');
    this.vehicleForm.patchValue({
      vehicleCode: `XE-${nextNum}`
    });
    this.showVehicleModal = true;
  }

  openEditVehicleModal(v: VehicleModel): void {
    this.isEditVehicleMode = true;
    this.selectedVehicle = v;
    this.vehicleForm.patchValue({
      vehicleCode: v.vehicleCode,
      name: v.name,
      licensePlate: v.licensePlate,
      payloadCapacity: v.payloadCapacity,
      status: v.status || 'AVAILABLE',
      inspectionExpirationDate: v.inspectionExpirationDate,
      insuranceExpirationDate: v.insuranceExpirationDate,
      employeeId: v.employeeId,
      vehicleTypeId: v.vehicleTypeId
    });
    this.showVehicleModal = true;
  }

  closeVehicleModal(): void {
    this.showVehicleModal = false;
  }

  onSaveVehicle(): void {
    if (this.vehicleForm.invalid) return;
    this.loading = true;
    const val = this.vehicleForm.getRawValue();

    if (this.isEditVehicleMode && this.selectedVehicle) {
      this.vehicleService.updateVehicle(this.selectedVehicle.id, val).subscribe({
        next: (res: any) => {
          this.loading = false;
          this.showSuccess(res.message || 'Thao tác thành công');
          this.closeVehicleModal();
          this.loadVehicles();
        },
        error: (err) => {
          this.loading = false;
          this.showError(err.error?.message || 'Thao tác thất bại');
        }
      });
    } else {
      this.vehicleService.createVehicle(val).subscribe({
        next: (res: any) => {
          this.loading = false;
          this.showSuccess(res.message || 'Thao tác thành công');
          this.closeVehicleModal();
          this.loadVehicles();
        },
        error: (err) => {
          this.loading = false;
          this.showError(err.error?.message || 'Thao tác thất bại');
        }
      });
    }
  }

  onDeleteVehicle(v: VehicleModel): void {
    this.confirmDialog.confirm({
      title: 'Xóa Hồ Sơ Phương Tiện',
      message: `Bạn có chắc chắn muốn xóa hồ sơ xe biển số "${v.licensePlate}" (${v.name || 'Phương tiện'})?`,
      confirmText: 'Đồng Ý Xóa',
      cancelText: 'Hủy Bỏ',
      type: 'danger',
      onConfirm: () => {
        this.loading = true;
        this.vehicleService.deleteVehicle(v.id).subscribe({
          next: (res: any) => {
            this.loading = false;
            this.showSuccess(res.message || 'Thao tác thành công');
            this.loadVehicles();
          },
          error: (err) => {
            this.loading = false;
            this.showError(err.error?.message || 'Thao tác thất bại');
          }
        });
      }
    });
  }

  // --- VEHICLE TYPE MODAL HANDLERS ---
  openCreateTypeModal(): void {
    this.isEditTypeMode = false;
    this.selectedType = null;
    this.typeForm.reset();
    this.typeForm.controls['vehicleTypeCode'].enable();
    this.showTypeModal = true;
  }

  openEditTypeModal(t: VehicleTypeModel): void {
    this.isEditTypeMode = true;
    this.selectedType = t;
    this.typeForm.patchValue({
      vehicleTypeCode: t.vehicleTypeCode,
      vehicleTypeName: t.vehicleTypeName,
      description: t.description
    });
    this.typeForm.controls['vehicleTypeCode'].disable();
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
      this.vehicleService.updateVehicleType(this.selectedType.vehicleTypeId, val).subscribe({
        next: (res: any) => {
          this.loading = false;
          this.showSuccess(res.message || 'Thao tác thành công');
          this.closeTypeModal();
          this.loadVehicleTypes();
        },
        error: (err) => {
          this.loading = false;
          this.showError(err.error?.message || 'Thao tác thất bại');
        }
      });
    } else {
      this.vehicleService.createVehicleType(val).subscribe({
        next: (res: any) => {
          this.loading = false;
          this.showSuccess(res.message || 'Thao tác thành công');
          this.closeTypeModal();
          this.loadVehicleTypes();
        },
        error: (err) => {
          this.loading = false;
          this.showError(err.error?.message || 'Thao tác thất bại');
        }
      });
    }
  }

  onDeleteType(t: VehicleTypeModel): void {
    this.confirmDialog.confirm({
      title: 'Xóa Loại Phương Tiện',
      message: `Bạn có chắc chắn muốn xóa loại phương tiện "${t.vehicleTypeName}" (${t.vehicleTypeCode})?`,
      confirmText: 'Đồng Ý Xóa',
      cancelText: 'Hủy Bỏ',
      type: 'danger',
      onConfirm: () => {
        this.loading = true;
        this.vehicleService.deleteVehicleType(t.vehicleTypeId).subscribe({
          next: (res: any) => {
            this.loading = false;
            this.showSuccess(res.message || 'Thao tác thành công');
            this.loadVehicleTypes();
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
