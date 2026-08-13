import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ShipmentService } from '@core/services/shipment.service';
import { CustomerService } from '@core/services/customer.service';
import { VehicleService } from '@core/services/vehicle.service';
import { EmployeeService } from '@core/services/employee.service';
import { ConfirmDialogService } from '@core/services/confirm-dialog.service';
import { ShipmentFormComponent } from '../shipment-form/shipment-form.component';
import { ShipmentModel, StatusEnumModel } from '@core/models/shipment.model';
import { CustomerModel, CompanyModel } from '@core/models/customer.model';
import { VehicleModel } from '@core/models/vehicle.model';
import { EmployeeModel } from '@core/models/employee.model';
import { ReportExportModalComponent } from '@shared/components/report-export-modal/report-export-modal.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { ReportExportService, ReportFilterOptions } from '@core/services/report-export.service';

import {
  TmsPageHeaderComponent,
  TmsMetricCardComponent,
  TmsTablePanelComponent,
  TmsSearchBoxComponent,
  TmsToastComponent,
  TmsStatusBadgeComponent
} from '@shared-ui';

@Component({
  selector: 'app-shipment-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ShipmentFormComponent,
    ReportExportModalComponent,
    PaginationComponent,
    TmsPageHeaderComponent,
    TmsMetricCardComponent,
    TmsTablePanelComponent,
    TmsSearchBoxComponent,
    TmsToastComponent,
    TmsStatusBadgeComponent
  ],
  templateUrl: './shipment-list.component.html',
  styleUrls: ['./shipment-list.component.css']
})


export class ShipmentListComponent implements OnInit {

  activeTab: 'shipments' | 'statuses' = 'shipments';
  loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Data State
  shipments: ShipmentModel[] = [];
  filteredShipments: ShipmentModel[] = [];
  statuses: StatusEnumModel[] = [];
  customers: CustomerModel[] = [];
  companies: CompanyModel[] = [];
  vehicles: VehicleModel[] = [];
  drivers: EmployeeModel[] = [];
  coDrivers: EmployeeModel[] = [];


  // Filter State
  searchQuery: string = '';
  selectedStatus: string = 'ALL';
  selectedDriverFilter: number | null = null;
  selectedVehicleFilter: number | null = null;

  // Pagination State
  paginatedShipments: ShipmentModel[] = [];
  currentPage: number = 1;
  pageSize: number = 10;


  // Modal State - Shipment
  showShipmentModal: boolean = false;
  showExportModal: boolean = false;

  isEditShipmentMode: boolean = false;
  selectedShipment: ShipmentModel | null = null;
  shipmentForm!: FormGroup;

  // Dynamic Multiple Places State
  receiptPlacesList: string[] = [''];
  deliveryPlacesList: string[] = [''];

  // Custom High-Contrast Dropdown State
  activeReceiptIndex: number | null = null;
  activeDeliveryIndex: number | null = null;

  // Driver Assignment Mode State
  useCustomDriver: boolean = false;

  // Formatted Financial Inputs State
  formattedRevenue: string = '0';
  formattedIncurredCosts: string = '0';

  // Modal State - Status
  showStatusModal: boolean = false;
  isEditStatusMode: boolean = false;
  selectedStatusItem: StatusEnumModel | null = null;
  statusForm!: FormGroup;

  // KPI Metrics
  totalShipmentsCount: number = 0;
  inTransitCount: number = 0;
  totalRevenue: number = 0;
  totalNetProfit: number = 0;

  constructor(
    private fb: FormBuilder,
    private shipmentService: ShipmentService,
    private customerService: CustomerService,
    private vehicleService: VehicleService,
    private employeeService: EmployeeService,
    private confirmDialog: ConfirmDialogService,
    private reportExportService: ReportExportService,
    private eRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadStatuses();
    this.loadCustomers();
    this.loadCompanies();
    this.loadVehicles();
    this.loadDrivers();
    this.loadShipments();
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  clickOut(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.closeAllDropdowns();
    }
  }

  closeAllDropdowns(): void {
    this.activeReceiptIndex = null;
    this.activeDeliveryIndex = null;
  }

  private initForms(): void {
    this.shipmentForm = this.fb.group({
      shipmentCode: ['', [Validators.required]],
      customerId: [null],
      cargoType: [''],
      receiptPlace: [''],
      deliveryPlace: [''],
      weight: [null],
      dateOfReceipt: [null],
      deliveryDate: [null],
      revenue: [0],
      incurredCosts: [0],
      vehicleId: [null],
      employeeId: [{ value: null, disabled: true }],
      coDriverId: [null],
      statusEnumId: [null],
      notes: ['']
    });


    this.statusForm = this.fb.group({
      statusEnumCode: ['', [Validators.required]],
      statusEnumName: ['', [Validators.required]],
      description: ['']
    });
  }

  setActiveTab(tab: 'shipments' | 'statuses'): void {
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

  // --- CURRENCY & NUMBER COMMA FORMATTING HELPERS ---
  formatNumberWithCommas(val: any): string {
    if (val === null || val === undefined || val === '') return '0';
    const digitsOnly = val.toString().replace(/\D/g, '');
    if (!digitsOnly) return '0';
    return Number(digitsOnly).toLocaleString('en-US');
  }

  parseCommasToNumber(val: string): number {
    if (!val) return 0;
    const digitsOnly = val.toString().replace(/\D/g, '');
    return digitsOnly ? Number(digitsOnly) : 0;
  }

  onRevenueInput(event: any): void {
    const rawVal = event.target.value;
    const num = this.parseCommasToNumber(rawVal);
    this.formattedRevenue = num > 0 ? num.toLocaleString('en-US') : (rawVal === '' ? '' : '0');
    this.shipmentForm.patchValue({ revenue: num });
  }

  onIncurredCostsInput(event: any): void {
    const rawVal = event.target.value;
    const num = this.parseCommasToNumber(rawVal);
    this.formattedIncurredCosts = num > 0 ? num.toLocaleString('en-US') : (rawVal === '' ? '' : '0');
    this.shipmentForm.patchValue({ incurredCosts: num });
  }

  // --- DATA LOADING ---
  loadStatuses(): void {
    this.shipmentService.getAllStatuses().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.statuses = res.data;
        }
      }
    });
  }

  loadCustomers(): void {
    this.customerService.getAllCustomers().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.customers = res.data;
        }
      }
    });
  }

  loadCompanies(): void {
    this.customerService.getAllCompanies().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.companies = res.data;
        }
      }
    });
  }

  loadVehicles(): void {
    this.vehicleService.getAllVehicles().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.vehicles = res.data;
        }
      }
    });
  }

  loadDrivers(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.drivers = res.data.filter(e => e.employeeTypeCode === 'DRIVER' || e.employeeTypeName?.toLowerCase().includes('lái'));
          this.coDrivers = res.data.filter(e => e.employeeTypeCode === 'CO_DRIVER' || e.employeeTypeName?.toLowerCase().includes('phụ'));
        }
      }
    });
  }


  loadShipments(): void {
    this.loading = true;
    this.shipmentService.getAllShipments().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.shipments = res.data;
          this.calculateMetrics();
          this.applyFilter();
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Không thể tải danh sách đơn hàng vận chuyển.';
      }
    });
  }

  private calculateMetrics(): void {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Filter items in current real-time month (from 1st to last day)
    const currentMonthShipments = this.shipments.filter(s => {
      if (!s.dateOfReceipt) return false;
      const d = new Date(s.dateOfReceipt);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    this.totalShipmentsCount = currentMonthShipments.length;
    this.inTransitCount = currentMonthShipments.filter(s => s.statusEnumCode === 'PICKED_UP').length;
    this.totalRevenue = currentMonthShipments.reduce((sum, s) => sum + (s.revenue || 0), 0);
    this.totalNetProfit = currentMonthShipments.reduce((sum, s) => sum + (s.netProfit || 0), 0);
  }


  applyFilter(): void {
    let result = [...this.shipments];

    if (this.selectedStatus && this.selectedStatus !== 'ALL') {
      result = result.filter(s => s.statusEnumCode === this.selectedStatus);
    }

    if (this.selectedDriverFilter) {
      result = result.filter(s => s.employeeId === Number(this.selectedDriverFilter));
    }

    if (this.selectedVehicleFilter) {
      result = result.filter(s => s.vehicleId === Number(this.selectedVehicleFilter));
    }

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(s => 
        (s.shipmentCode && s.shipmentCode.toLowerCase().includes(q)) ||
        (s.customerName && s.customerName.toLowerCase().includes(q)) ||
        (s.cargoType && s.cargoType.toLowerCase().includes(q)) ||
        (s.receiptPlace && s.receiptPlace.toLowerCase().includes(q)) ||
        (s.deliveryPlace && s.deliveryPlace.toLowerCase().includes(q)) ||
        (s.licensePlate && s.licensePlate.toLowerCase().includes(q)) ||
        (s.driverName && s.driverName.toLowerCase().includes(q))
      );
    }

    this.filteredShipments = result;
    this.currentPage = 1;
    this.updatePaginatedShipments();
  }

  updatePaginatedShipments(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedShipments = this.filteredShipments.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedShipments();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updatePaginatedShipments();
  }


  onSearchChange(): void {
    this.applyFilter();
  }

  onStatusFilterChange(code: string): void {
    this.selectedStatus = code;
    this.applyFilter();
  }

  // Helper method to split string by newline or semicolon for HTML bullet lists
  splitPlaceString(placeStr?: string): string[] {
    if (!placeStr) return [];
    return placeStr.split(/\n|;/).map(p => p.trim()).filter(p => p.length > 0);
  }

  // --- DYNAMIC PLACES HANDLERS ---
  addReceiptPlace(): void {
    this.receiptPlacesList.push('');
  }

  removeReceiptPlace(index: number): void {
    if (this.receiptPlacesList.length > 1) {
      this.receiptPlacesList.splice(index, 1);
    } else {
      this.receiptPlacesList[0] = '';
    }
  }

  addDeliveryPlace(): void {
    this.deliveryPlacesList.push('');
  }

  removeDeliveryPlace(index: number): void {
    if (this.deliveryPlacesList.length > 1) {
      this.deliveryPlacesList.splice(index, 1);
    } else {
      this.deliveryPlacesList[0] = '';
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  // --- CUSTOM AUTOCOMPLETE DROPDOWN HANDLERS ---
  onFocusReceiptInput(index: number): void {
    this.activeDeliveryIndex = null;
    this.activeReceiptIndex = index;
  }

  onFocusDeliveryInput(index: number): void {
    this.activeReceiptIndex = null;
    this.activeDeliveryIndex = index;
  }

  getFilteredCompanies(query: string): CompanyModel[] {
    if (!query || query.trim() === '') {
      return this.companies.slice(0, 8);
    }
    const q = query.toLowerCase().trim();
    return this.companies.filter(c => 
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q)) ||
      (c.companyCode && c.companyCode.toLowerCase().includes(q))
    ).slice(0, 10);
  }

  selectReceiptCompany(index: number, comp: CompanyModel): void {
    this.receiptPlacesList[index] = comp.name;
    this.activeReceiptIndex = null;
  }

  selectDeliveryCompany(index: number, comp: CompanyModel): void {
    this.deliveryPlacesList[index] = comp.name;
    this.activeDeliveryIndex = null;
  }


  // --- AUTO CREATE MISSING COMPANIES FROM PLACES ---
  private async checkAndAutoCreateCompanies(places: string[]): Promise<void> {
    for (const place of places) {
      const trimmed = place.trim();
      if (!trimmed) continue;

      const possibleName = trimmed.split(',')[0].trim();
      
      const exists = this.companies.some(c => 
        (c.name && c.name.toLowerCase().trim() === possibleName.toLowerCase()) ||
        (c.name && possibleName.toLowerCase().includes(c.name.toLowerCase().trim()))
      );

      if (!exists && possibleName.length > 2) {
        try {
          const codeNum = Math.floor(1000 + Math.random() * 9000);
          const newCompReq = {
            companyCode: `CTY-${codeNum}`,
            name: possibleName,
            address: trimmed
          };
          const res = await this.customerService.createCompany(newCompReq).toPromise();
          if (res && res.data) {
            this.companies.push(res.data);
          }
        } catch (err) {
          console.warn('Tự động tạo công ty mới từ địa điểm thất bại:', possibleName, err);
        }
      }
    }
  }

  // --- VEHICLE & DRIVER AUTO ASSIGNMENT ---
  onVehicleChange(event: any): void {
    const rawVal = event.target.value;
    const vehicleId = rawVal ? Number(rawVal) : null;
    
    if (vehicleId) {
      const v = this.vehicles.find(item => item.id === vehicleId);
      if (v && v.employeeId) {
        this.shipmentForm.patchValue({ employeeId: v.employeeId });
      } else {
        this.shipmentForm.patchValue({ employeeId: null });
      }
    } else {
      this.shipmentForm.patchValue({ employeeId: null });
    }

    if (!this.useCustomDriver) {
      this.shipmentForm.controls['employeeId'].disable();
    } else {
      this.shipmentForm.controls['employeeId'].enable();
    }
  }

  onToggleCustomDriver(): void {
    this.useCustomDriver = !this.useCustomDriver;
    if (this.useCustomDriver) {
      this.shipmentForm.controls['employeeId'].enable();
    } else {
      this.shipmentForm.controls['employeeId'].disable();
      // Re-apply vehicle default driver if unchecked
      const vehicleId = this.shipmentForm.get('vehicleId')?.value;
      if (vehicleId) {
        const v = this.vehicles.find(item => item.id === Number(vehicleId));
        if (v && v.employeeId) {
          this.shipmentForm.patchValue({ employeeId: v.employeeId });
        } else {
          this.shipmentForm.patchValue({ employeeId: null });
        }
      } else {
        this.shipmentForm.patchValue({ employeeId: null });
      }
    }
  }


  // --- QUICK STATUS SWITCHER ---
  onQuickStatusChange(shipment: ShipmentModel, newStatusCode: string): void {
    this.clearAlerts();
    this.loading = true;
    this.shipmentService.updateShipmentStatus(shipment.shipmentId, newStatusCode).subscribe({
      next: (res) => {
        this.loading = false;
        this.showSuccess(res.message || 'Cập nhật trạng thái thành công');
        this.loadShipments();
      },
      error: (err) => {
        this.loading = false;
        this.showError(err.error?.message || err.error?.data || 'Cập nhật trạng thái thất bại');
      }
    });
  }

  // --- SHIPMENT MODAL HANDLERS ---
  openCreateShipmentModal(): void {
    this.clearAlerts();
    this.isEditShipmentMode = false;
    this.selectedShipment = null;
    this.useCustomDriver = false;
    this.receiptPlacesList = [''];
    this.deliveryPlacesList = [''];
    this.formattedRevenue = '0';
    this.formattedIncurredCosts = '0';
    this.closeAllDropdowns();
    
    this.shipmentForm.reset();
    
    const year = new Date().getFullYear();
    let num = this.shipments.length + 1;
    let nextCode = `DH-${year}-${num.toString().padStart(3, '0')}`;
    const existingCodes = new Set(this.shipments.map(s => s.shipmentCode?.toUpperCase()));
    while (existingCodes.has(nextCode.toUpperCase())) {
      num++;
      nextCode = `DH-${year}-${num.toString().padStart(3, '0')}`;
    }
    
    let defaultStatusId = null;
    const createdStatus = this.statuses.find(st => st.statusEnumCode === 'CREATED');
    if (createdStatus) defaultStatusId = createdStatus.statusEnumId;

    this.shipmentForm.patchValue({
      shipmentCode: nextCode,
      revenue: 0,
      incurredCosts: 0,
      statusEnumId: defaultStatusId,
      vehicleId: null,
      employeeId: null,
      coDriverId: null
    });

    this.shipmentForm.controls['shipmentCode'].enable();
    this.shipmentForm.controls['employeeId'].disable();
    this.showShipmentModal = true;
  }


  openEditShipmentModal(s: ShipmentModel): void {
    this.clearAlerts();
    this.isEditShipmentMode = true;
    this.selectedShipment = s;
    this.useCustomDriver = false;
    this.closeAllDropdowns();

    // Format currency display
    this.formattedRevenue = this.formatNumberWithCommas(s.revenue || 0);
    this.formattedIncurredCosts = this.formatNumberWithCommas(s.incurredCosts || 0);

    // Parse multi-places
    this.receiptPlacesList = this.splitPlaceString(s.receiptPlace);
    if (this.receiptPlacesList.length === 0) this.receiptPlacesList = [''];

    this.deliveryPlacesList = this.splitPlaceString(s.deliveryPlace);
    if (this.deliveryPlacesList.length === 0) this.deliveryPlacesList = [''];

    // Check if assigned driver differs from vehicle default driver
    if (s.vehicleId && s.employeeId) {
      const v = this.vehicles.find(item => item.id === s.vehicleId);
      if (v && v.employeeId !== s.employeeId) {
        this.useCustomDriver = true;
      }
    }

    let dateReceiptStr = s.dateOfReceipt ? s.dateOfReceipt.substring(0, 10) : null;
    let dateDeliveryStr = s.deliveryDate ? s.deliveryDate.substring(0, 10) : null;

    this.shipmentForm.patchValue({
      shipmentCode: s.shipmentCode,
      customerId: s.customerId,
      cargoType: s.cargoType,
      receiptPlace: s.receiptPlace,
      deliveryPlace: s.deliveryPlace,
      weight: s.weight,
      dateOfReceipt: dateReceiptStr,
      deliveryDate: dateDeliveryStr,
      revenue: s.revenue || 0,
      incurredCosts: s.incurredCosts || 0,
      vehicleId: s.vehicleId,
      employeeId: s.employeeId,
      coDriverId: s.coDriverId,
      statusEnumId: s.statusEnumId,
      notes: s.notes
    });
    this.shipmentForm.controls['shipmentCode'].disable();
    if (this.useCustomDriver) {
      this.shipmentForm.controls['employeeId'].enable();
    } else {
      this.shipmentForm.controls['employeeId'].disable();
    }
    this.showShipmentModal = true;
  }

  closeShipmentModal(): void {
    this.showShipmentModal = false;
    this.closeAllDropdowns();
  }

  async onSaveShipment(): Promise<void> {
    this.clearAlerts();
    this.closeAllDropdowns();
    
    // Join multi-places into string separated by newline
    const joinedReceipt = this.receiptPlacesList.map(p => p.trim()).filter(p => p.length > 0).join('\n');
    const joinedDelivery = this.deliveryPlacesList.map(p => p.trim()).filter(p => p.length > 0).join('\n');

    this.shipmentForm.patchValue({
      receiptPlace: joinedReceipt,
      deliveryPlace: joinedDelivery,
      revenue: this.parseCommasToNumber(this.formattedRevenue),
      incurredCosts: this.parseCommasToNumber(this.formattedIncurredCosts)
    });

    if (this.shipmentForm.invalid) {
      this.shipmentForm.markAllAsTouched();
      this.errorMessage = 'Vui lòng kiểm tra và nhập đầy đủ các trường bắt buộc (*) như Mã Đơn Hàng!';
      return;
    }

    this.loading = true;

    // Auto-create any missing companies from entered receipt/delivery places
    const allPlaces = [...this.receiptPlacesList, ...this.deliveryPlacesList];
    await this.checkAndAutoCreateCompanies(allPlaces);

    const val = { ...this.shipmentForm.getRawValue() };

    // Format date strings YYYY-MM-DD to ISO LocalDateTime YYYY-MM-DDTHH:mm:ss for Spring Boot Jackson
    if (val.dateOfReceipt && typeof val.dateOfReceipt === 'string' && val.dateOfReceipt.length === 10) {
      val.dateOfReceipt = `${val.dateOfReceipt}T00:00:00`;
    }
    if (val.deliveryDate && typeof val.deliveryDate === 'string' && val.deliveryDate.length === 10) {
      val.deliveryDate = `${val.deliveryDate}T00:00:00`;
    }

    // Convert IDs & numbers
    if (val.customerId) val.customerId = Number(val.customerId);
    if (val.vehicleId) val.vehicleId = Number(val.vehicleId);
    if (val.employeeId) val.employeeId = Number(val.employeeId);
    if (val.coDriverId) val.coDriverId = Number(val.coDriverId);
    if (val.statusEnumId) val.statusEnumId = Number(val.statusEnumId);


    if (this.isEditShipmentMode && this.selectedShipment) {
      this.shipmentService.updateShipment(this.selectedShipment.shipmentId, val).subscribe({
        next: (res) => {
          this.loading = false;
          this.showSuccess(res.message || 'Thao tác thành công');
          this.closeShipmentModal();
          this.loadShipments();
        },
        error: (err) => {
          this.loading = false;
          this.showError(err.error?.message || err.error?.data || 'Thao tác thất bại');
        }
      });
    } else {
      this.shipmentService.createShipment(val).subscribe({
        next: (res) => {
          this.loading = false;
          this.showSuccess(res.message || 'Thao tác thành công');
          this.closeShipmentModal();
          this.loadShipments();
        },
        error: (err) => {
          this.loading = false;
          this.showError(err.error?.message || err.error?.data || 'Thao tác thất bại');
        }
      });
    }
  }

  onDeleteShipment(s: ShipmentModel): void {
    this.clearAlerts();
    this.confirmDialog.confirm({
      title: 'Xóa Đơn Hàng Vận Chuyển',
      message: `Bạn có chắc chắn muốn xóa đơn hàng vận chuyển "${s.shipmentCode}" khỏi hệ thống?`,
      confirmText: 'Đồng Ý Xóa',
      cancelText: 'Hủy Bỏ',
      type: 'danger',
      onConfirm: () => {
        this.loading = true;
        this.shipmentService.deleteShipment(s.shipmentId).subscribe({
          next: (res) => {
            this.loading = false;
            this.showSuccess(res.message || 'Thao tác thành công');
            this.loadShipments();
          },
          error: (err) => {
            this.loading = false;
            this.showError(err.error?.message || err.error?.data || 'Thao tác thất bại');
          }
        });
      }
    });
  }

  // --- STATUS MODAL HANDLERS ---
  openCreateStatusModal(): void {
    this.clearAlerts();
    this.isEditStatusMode = false;
    this.selectedStatusItem = null;
    this.statusForm.reset();
    this.showStatusModal = true;
  }

  openEditStatusModal(st: StatusEnumModel): void {
    this.clearAlerts();
    this.isEditStatusMode = true;
    this.selectedStatusItem = st;
    this.statusForm.patchValue({
      statusEnumCode: st.statusEnumCode,
      statusEnumName: st.statusEnumName,
      description: st.description
    });
    this.showStatusModal = true;
  }

  closeStatusModal(): void {
    this.showStatusModal = false;
  }

  onSaveStatus(): void {
    this.clearAlerts();
    if (this.statusForm.invalid) {
      this.statusForm.markAllAsTouched();
      this.errorMessage = 'Vui lòng kiểm tra và nhập đầy đủ Mã & Tên trạng thái (*) !';
      return;
    }

    this.loading = true;
    const val = this.statusForm.getRawValue();

    if (this.isEditStatusMode && this.selectedStatusItem) {
      this.shipmentService.updateStatus(this.selectedStatusItem.statusEnumId, val).subscribe({
        next: (res) => {
          this.loading = false;
          this.showSuccess(res.message || 'Thao tác thành công');
          this.closeStatusModal();
          this.loadStatuses();
        },
        error: (err) => {
          this.loading = false;
          this.showError(err.error?.message || err.error?.data || 'Thao tác thất bại');
        }
      });
    } else {
      this.shipmentService.createStatus(val).subscribe({
        next: (res) => {
          this.loading = false;
          this.showSuccess(res.message || 'Thao tác thành công');
          this.closeStatusModal();
          this.loadStatuses();
        },
        error: (err) => {
          this.loading = false;
          this.showError(err.error?.message || err.error?.data || 'Thao tác thất bại');
        }
      });
    }
  }

  onDeleteStatus(st: StatusEnumModel): void {
    this.clearAlerts();
    this.confirmDialog.confirm({
      title: 'Xóa Trạng Thái Vận Chuyển',
      message: `Bạn có chắc chắn muốn xóa trạng thái "${st.statusEnumName}" (${st.statusEnumCode})?`,
      confirmText: 'Đồng Ý Xóa',
      cancelText: 'Hủy Bỏ',
      type: 'danger',
      onConfirm: () => {
        this.loading = true;
        this.shipmentService.deleteStatus(st.statusEnumId).subscribe({
          next: (res) => {
            this.loading = false;
            this.showSuccess(res.message || 'Thao tác thành công');
            this.loadStatuses();
          },
        });
      }
    });
  }

  onExportExcel(): void {
    this.showExportModal = true;
  }

  closeExportModal(): void {
    this.showExportModal = false;
  }

  onConfirmExport(options: ReportFilterOptions): void {
    this.showExportModal = false;
    this.reportExportService.exportShipments(options).subscribe({
      next: (blob) => {
        const ext = options.format || 'xlsx';
        this.reportExportService.downloadBlob(blob, `Bao_Cao_Don_Hang_Shipments.${ext}`);
        this.showSuccess(`Xuất file báo cáo đơn hàng (${ext.toUpperCase()}) thành công!`);
      },
      error: () => {
        this.showError('Có lỗi xảy ra khi xuất file báo cáo đơn hàng.');
      }
    });
  }
}



