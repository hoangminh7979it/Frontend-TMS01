import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PayrollService } from '@core/services/payroll.service';
import { EmployeeService } from '@core/services/employee.service';
import { ShipmentService } from '@core/services/shipment.service';
import { VehicleService } from '@core/services/vehicle.service';
import { ConfirmDialogService } from '@core/services/confirm-dialog.service';
import { PayrollFormComponent } from '../payroll-form/payroll-form.component';
import { SalaryModel } from '@core/models/payroll.model';
import { EmployeeModel, EmployeeTypeModel } from '@core/models/employee.model';
import { ShipmentModel } from '@core/models/shipment.model';
import { VehicleModel } from '@core/models/vehicle.model';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { ReportExportService, ReportFilterOptions } from '@core/services/report-export.service';
import { ToastService } from '@core/services/toast.service';
import { ExcelImportExportService } from '@core/services/excel-import-export.service';

import {
  TmsPageHeaderComponent,
  TmsMetricCardComponent,
  TmsTablePanelComponent,
  TmsSearchBoxComponent,
  TmsToastComponent,
  TmsStatusBadgeComponent,
  ExcelImportModalComponent
} from '@shared-ui';

@Component({
  selector: 'app-payroll-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    PayrollFormComponent,
    PaginationComponent,
    ExcelImportModalComponent,
    TmsPageHeaderComponent,
    TmsMetricCardComponent,
    TmsTablePanelComponent,
    TmsSearchBoxComponent,
    TmsToastComponent,
    TmsStatusBadgeComponent
  ],
  templateUrl: './payroll-list.component.html',
  styleUrls: ['./payroll-list.component.css']
})


export class PayrollListComponent implements OnInit {

  loading: boolean = false;

  shipmentLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Data State
  salaries: SalaryModel[] = [];
  filteredSalaries: SalaryModel[] = [];
  employeeTypes: EmployeeTypeModel[] = [];
  drivers: EmployeeModel[] = [];

  // Shipments of the selected driver in modal (auto-loaded)
  driverShipmentsInRange: ShipmentModel[] = [];

  // Distinct vehicles extracted from driver's shipments
  vehicleOptions: { vehicleId: number; licensePlate: string; vehicleName: string }[] = [];

  // Filter State
  searchQuery: string = '';
  selectedDriverFilter: number | null = null;
  selectedVehicleFilter: number | null = null;

  // Pagination State
  paginatedSalaries: SalaryModel[] = [];
  currentPage: number = 1;
  pageSize: number = 10;

  vehicles: VehicleModel[] = [];

  // Modal State - Salary
  showSalaryModal: boolean = false;
  isEditSalaryMode: boolean = false;
  selectedSalary: SalaryModel | null = null;
  salaryForm!: FormGroup;

  // Formatted Financial Inputs State (Salary Modal)
  formattedBasicCosts: string = '0';
  formattedBasicPerDay: string = '0';
  formattedAllowanceCosts: string = '0';
  formattedDeductionCosts: string = '0';
  formattedTotalSalaryCosts: string = '0';

  // KPI Metrics
  totalSalariesPaidAmount: number = 0;
  totalShipmentsRewardedCount: number = 0;
  averageSalaryPerDriver: number = 0;

  showImportExcelModal: boolean = false;

  constructor(
    private fb: FormBuilder,
    private payrollService: PayrollService,
    private employeeService: EmployeeService,
    private shipmentService: ShipmentService,
    private vehicleService: VehicleService,
    private confirmDialog: ConfirmDialogService,
    private reportExportService: ReportExportService,
    private toastService: ToastService,
    private excelService: ExcelImportExportService
  ) {}

  onDownloadExcelTemplate(): void {
    this.excelService.downloadTemplate('payroll');
    this.toastService.info('Đã tải về file Excel mẫu rỗng thành công!');
  }

  onOpenImportExcelModal(): void {
    this.showImportExcelModal = true;
  }

  onExcelDataImported(rows: any[]): void {
    if (!rows || rows.length === 0) return;

    this.loading = true;
    let successCount = 0;
    let failCount = 0;

    const promises = rows.map(r => {
      const payload: any = {
        salaryCode: r.salaryCode,
        employeeCode: r.employeeCode,
        workDaysCount: r.workDaysCount ? Number(r.workDaysCount) : 26,
        salaryBasicPerDay: r.salaryBasicPerDay ? Number(r.salaryBasicPerDay) : 0,
        totalSalaryPerShipment: r.totalSalaryPerShipment ? Number(r.totalSalaryPerShipment) : 0,
        allowanceCosts: r.allowanceCosts ? Number(r.allowanceCosts) : 0,
        deductionCosts: r.deductionCosts ? Number(r.deductionCosts) : 0,
        notes: r.notes || ''
      };

      if (r.startDate) payload.startDate = r.startDate;
      if (r.endDate) payload.endDate = r.endDate;

      return this.payrollService.createSalary(payload).toPromise()
        .then(() => { successCount++; })
        .catch(() => { failCount++; });
    });

    Promise.all(promises).then(() => {
      this.loading = false;
      this.loadSalaries();
      if (successCount > 0) {
        this.toastService.success(`Đã nhập thành công ${successCount} hồ sơ lương từ file Excel!`);
      }
      if (failCount > 0) {
        this.toastService.warning(`Có ${failCount} dòng không nhập được do trùng mã bảng lương hoặc lỗi dữ liệu.`);
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.loadEmployeeTypes();
    this.loadDrivers();
    this.loadVehicles();
    this.loadSalaries();
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

  private initForm(): void {
    this.salaryForm = this.fb.group({
      salaryCode: ['', [Validators.required]],
      employeeId: [null, [Validators.required]],
      startDate: [null],
      endDate: [null],
      workDaysCount: [26],
      salaryBasicPerDay: [0],
      totalShipmentCount: [0],
      driverShipmentRevenue: [0],
      tripSalaryPercentage: [0],
      salaryBasicCosts: [0],
      totalSalaryPerShipment: [0],
      allowanceCosts: [0],
      deductionCosts: [0],
      salaryCosts: [0],
      notes: ['']
    });
  }

  clearAlerts(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }

  showSuccess(msg: string): void {
    this.toastService.success(msg);
  }

  showError(msg: string): void {
    this.toastService.error(msg);
  }

  // --- COMMA FORMATTING HELPERS ---
  formatNumberWithCommas(val: any): string {
    if (val === null || val === undefined || val === '') return '0';
    const n = Number(String(val).replace(/\D/g, ''));
    return isNaN(n) ? '0' : n.toLocaleString('en-US');
  }

  parseCommasToNumber(val: string): number {
    if (!val) return 0;
    const n = Number(String(val).replace(/\D/g, ''));
    return isNaN(n) ? 0 : n;
  }

  // --- AUTO-FETCH SHIPMENTS WHEN DRIVER OR DATES CHANGE ---
  private tryAutoFetchShipments(): void {
    const empId = this.salaryForm.get('employeeId')?.value;
    const startDate = this.salaryForm.get('startDate')?.value;
    const endDate = this.salaryForm.get('endDate')?.value;

    if (!empId) {
      this.driverShipmentsInRange = [];
      return;
    }

    this.shipmentLoading = true;
    this.driverShipmentsInRange = [];

    this.shipmentService.getShipmentsByEmployee(
      Number(empId),
      startDate || undefined,
      endDate || undefined
    ).subscribe({
      next: (res) => {
        this.shipmentLoading = false;
        const shipments = res.data || [];
        this.driverShipmentsInRange = shipments;
        this.syncShipmentDataToForm(shipments);
      },
      error: () => {
        this.shipmentLoading = false;
      }
    });
  }

  private syncShipmentDataToForm(shipments: ShipmentModel[]): void {
    const count = shipments.length;
    const totalRevenue = shipments.reduce((sum, s) => sum + (s.revenue || 0), 0);

    // Đếm số ngày giao hàng khác nhau (distinct deliveryDate) làm ngày công
    const distinctDeliveryDays = new Set(
      shipments
        .filter(s => !!s.deliveryDate)
        .map(s => s.deliveryDate!.substring(0, 10)) // lấy phần YYYY-MM-DD
    ).size;

    // Trích xuất danh sách phương tiện khác nhau từ chuyến hàng
    const vehicleMap = new Map<number, { vehicleId: number; licensePlate: string; vehicleName: string }>();
    shipments.forEach(s => {
      if (s.vehicleId && !vehicleMap.has(s.vehicleId)) {
        vehicleMap.set(s.vehicleId, {
          vehicleId: s.vehicleId,
          licensePlate: s.licensePlate || '',
          vehicleName: s.vehicleName || ''
        });
      }
    });
    this.vehicleOptions = Array.from(vehicleMap.values());

    this.salaryForm.patchValue({
      totalShipmentCount: count,
      driverShipmentRevenue: totalRevenue,
      workDaysCount: distinctDeliveryDays
    });

    this.formattedDriverRevenue = totalRevenue > 0 ? totalRevenue.toLocaleString('en-US') : '0';
    this.recalculateTotalSalary();
  }

  // Track formatted driver revenue separately for display
  formattedDriverRevenue: string = '0';

  // --- DRIVER CHANGE ---
  onDriverChange(event: any): void {
    this.tryAutoFetchShipments();
  }

  // --- DATE CHANGE ---
  onStartDateChange(): void {
    this.tryAutoFetchShipments();
  }

  onEndDateChange(): void {
    this.tryAutoFetchShipments();
  }

  // --- REAL-TIME FINANCIAL CALCULATION ---
  onBasicCostInput(event: any): void {
    const num = this.parseCommasToNumber(event.target.value);
    this.formattedBasicCosts = event.target.value ? num.toLocaleString('en-US') : '0';
    this.salaryForm.patchValue({ salaryBasicCosts: num });
    this.recalculateTotalSalary();
  }

  onBasicPerDayInput(event: any): void {
    const num = this.parseCommasToNumber(event.target.value);
    this.formattedBasicPerDay = event.target.value ? num.toLocaleString('en-US') : '0';
    this.salaryForm.patchValue({ salaryBasicPerDay: num });
    this.recalculateTotalSalary();
  }

  onWorkDaysInput(): void {
    this.recalculateTotalSalary();
  }

  onDriverRevenueInput(event: any): void {
    const num = this.parseCommasToNumber(event.target.value);
    this.formattedDriverRevenue = event.target.value ? num.toLocaleString('en-US') : '0';
    this.salaryForm.patchValue({ driverShipmentRevenue: num });
    this.recalculateTotalSalary();
  }

  onTripPercentageInput(): void {
    this.recalculateTotalSalary();
  }

  onAllowanceInput(event: any): void {
    const num = this.parseCommasToNumber(event.target.value);
    this.formattedAllowanceCosts = event.target.value ? num.toLocaleString('en-US') : '0';
    this.salaryForm.patchValue({ allowanceCosts: num });
    this.recalculateTotalSalary();
  }

  onDeductionInput(event: any): void {
    const num = this.parseCommasToNumber(event.target.value);
    this.formattedDeductionCosts = event.target.value ? num.toLocaleString('en-US') : '0';
    this.salaryForm.patchValue({ deductionCosts: num });
    this.recalculateTotalSalary();
  }

  recalculateTotalSalary(): void {
    const perDay = this.parseCommasToNumber(this.formattedBasicPerDay);
    const workDays = Number(this.salaryForm.get('workDaysCount')?.value || 0);

    let basic = this.parseCommasToNumber(this.formattedBasicCosts);
    if (perDay > 0 && workDays > 0) {
      basic = perDay * workDays;
      this.formattedBasicCosts = basic.toLocaleString('en-US');
      this.salaryForm.patchValue({ salaryBasicCosts: basic });
    }

    const tripPercent = Number(this.salaryForm.get('tripSalaryPercentage')?.value || 0);
    const driverRevenue = this.parseCommasToNumber(this.formattedDriverRevenue);

    let tripSalary = 0;
    if (tripPercent > 0 && driverRevenue > 0) {
      tripSalary = (driverRevenue * tripPercent) / 100;
    }

    this.salaryForm.patchValue({ totalSalaryPerShipment: Math.round(tripSalary) });

    const allowances = this.parseCommasToNumber(this.formattedAllowanceCosts);
    const deductions = this.parseCommasToNumber(this.formattedDeductionCosts);

    const total = basic + tripSalary + allowances - deductions;
    this.formattedTotalSalaryCosts = total > 0 ? Math.round(total).toLocaleString('en-US') : '0';
    this.salaryForm.patchValue({ salaryCosts: Math.round(total) });
  }

  // --- DATA LOADING ---
  loadEmployeeTypes(): void {
    this.employeeService.getAllEmployeeTypes().subscribe({
      next: (res) => { if (res.success && res.data) this.employeeTypes = res.data; }
    });
  }

  loadDrivers(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.drivers = res.data;
        }
      }
    });
  }

  loadSalaries(): void {
    this.loading = true;
    this.payrollService.getAllSalaries().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.salaries = res.data;
          this.calculateMetrics();
          this.applyFilter();
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Không thể tải danh sách phiếu lương nhân sự.';
      }
    });
  }

  private calculateMetrics(): void {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const currentMonthSalaries = this.salaries.filter(s => {
      if (!s.startDate) return false;
      const d = new Date(s.startDate);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    this.totalSalariesPaidAmount = currentMonthSalaries.reduce((sum, s) => sum + (s.salaryCosts || 0), 0);
    this.totalShipmentsRewardedCount = currentMonthSalaries.reduce((sum, s) => sum + (s.totalShipmentCount || 0), 0);
    this.averageSalaryPerDriver = currentMonthSalaries.length > 0 ? (this.totalSalariesPaidAmount / currentMonthSalaries.length) : 0;
  }


  applyFilter(): void {
    let result = [...this.salaries];

    if (this.selectedDriverFilter) {
      result = result.filter(s => s.employeeId === Number(this.selectedDriverFilter));
    }

    if (this.selectedVehicleFilter) {
      const selectedV = this.vehicles.find(v => v.id === Number(this.selectedVehicleFilter));
      if (selectedV && selectedV.licensePlate) {
        const plate = selectedV.licensePlate.toLowerCase();
        result = result.filter(s => 
          (s.vehicleId === selectedV.id) ||
          (s.licensePlates && s.licensePlates.some(lp => lp.toLowerCase() === plate))
        );
      }
    }

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(s =>
        (s.salaryCode && s.salaryCode.toLowerCase().includes(q)) ||
        (s.employeeName && s.employeeName.toLowerCase().includes(q)) ||
        (s.employeeCode && s.employeeCode.toLowerCase().includes(q)) ||
        (s.notes && s.notes.toLowerCase().includes(q))
      );
    }
    this.filteredSalaries = result;
    this.currentPage = 1;
    this.updatePaginatedSalaries();
  }

  updatePaginatedSalaries(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedSalaries = this.filteredSalaries.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedSalaries();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updatePaginatedSalaries();
  }


  onSearchChange(): void {
    this.applyFilter();
  }

  // --- SALARY MODAL HANDLERS ---
  openCreateSalaryModal(): void {
    this.clearAlerts();
    this.isEditSalaryMode = false;
    this.selectedSalary = null;
    this.driverShipmentsInRange = [];
    this.vehicleOptions = [];

    this.formattedBasicCosts = '0';
    this.formattedBasicPerDay = '0';
    this.formattedDriverRevenue = '0';
    this.formattedAllowanceCosts = '0';
    this.formattedDeductionCosts = '0';
    this.formattedTotalSalaryCosts = '0';

    this.salaryForm.reset();

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    let num = this.salaries.length + 1;
    let nextCode = `LUONG-${year}${month}-${num.toString().padStart(3, '0')}`;
    const existingCodes = new Set(this.salaries.map(s => s.salaryCode?.toUpperCase()));
    while (existingCodes.has(nextCode.toUpperCase())) {
      num++;
      nextCode = `LUONG-${year}${month}-${num.toString().padStart(3, '0')}`;
    }

    // Default date range: first to last of current month
    const firstDay = `${year}-${month}-01`;
    const lastDay = new Date(year, now.getMonth() + 1, 0);
    const lastDayStr = `${year}-${month}-${String(lastDay.getDate()).padStart(2, '0')}`;

    this.salaryForm.patchValue({
      salaryCode: nextCode,

      startDate: firstDay,
      endDate: lastDayStr,
      workDaysCount: 26,
      totalShipmentCount: 0,
      driverShipmentRevenue: 0,
      tripSalaryPercentage: 0,
      salaryBasicCosts: 0,
      salaryBasicPerDay: 0,
      totalSalaryPerShipment: 0,
      allowanceCosts: 0,
      deductionCosts: 0,
      salaryCosts: 0
    });

    this.salaryForm.controls['salaryCode'].enable();
    this.showSalaryModal = true;
  }

  openEditSalaryModal(s: SalaryModel): void {
    this.clearAlerts();
    this.isEditSalaryMode = true;
    this.selectedSalary = s;
    this.driverShipmentsInRange = [];
    this.vehicleOptions = [];

    this.formattedBasicCosts = this.formatNumberWithCommas(s.salaryBasicCosts || 0);
    this.formattedBasicPerDay = this.formatNumberWithCommas(s.salaryBasicPerDay || 0);
    this.formattedDriverRevenue = this.formatNumberWithCommas(s.driverShipmentRevenue || 0);
    this.formattedAllowanceCosts = this.formatNumberWithCommas(s.allowanceCosts || 0);
    this.formattedDeductionCosts = this.formatNumberWithCommas(s.deductionCosts || 0);
    this.formattedTotalSalaryCosts = this.formatNumberWithCommas(s.salaryCosts || 0);

    this.salaryForm.patchValue({
      salaryCode: s.salaryCode,
      employeeId: s.employeeId,
      startDate: s.startDate,
      endDate: s.endDate,
      workDaysCount: s.workDaysCount || 26,
      salaryBasicPerDay: s.salaryBasicPerDay || 0,
      totalShipmentCount: s.totalShipmentCount || 0,
      driverShipmentRevenue: s.driverShipmentRevenue || 0,
      tripSalaryPercentage: s.tripSalaryPercentage || 0,
      salaryBasicCosts: s.salaryBasicCosts || 0,
      totalSalaryPerShipment: s.totalSalaryPerShipment || 0,
      allowanceCosts: s.allowanceCosts || 0,
      deductionCosts: s.deductionCosts || 0,
      salaryCosts: s.salaryCosts || 0,
      notes: s.notes
    });

    this.salaryForm.controls['salaryCode'].disable();

    // Auto-load shipments for this driver in the saved date range
      if (s.employeeId && s.startDate && s.endDate) {
        this.shipmentLoading = true;
        this.shipmentService.getShipmentsByEmployee(s.employeeId, s.startDate, s.endDate).subscribe({
          next: (res) => {
            this.shipmentLoading = false;
            this.driverShipmentsInRange = res.data || [];
            // Rebuild vehicle options from stored shipments (for edit mode)
            const vehicleMap = new Map<number, { vehicleId: number; licensePlate: string; vehicleName: string }>();
            this.driverShipmentsInRange.forEach(ship => {
              if (ship.vehicleId && !vehicleMap.has(ship.vehicleId)) {
                vehicleMap.set(ship.vehicleId, {
                  vehicleId: ship.vehicleId,
                  licensePlate: ship.licensePlate || '',
                  vehicleName: ship.vehicleName || ''
                });
              }
            });
            this.vehicleOptions = Array.from(vehicleMap.values());
          },
          error: () => { this.shipmentLoading = false; }
        });
      }

    this.showSalaryModal = true;
  }

  closeSalaryModal(): void {
    this.showSalaryModal = false;
    this.driverShipmentsInRange = [];
  }

  onSaveSalary(): void {
    this.clearAlerts();
    if (this.salaryForm.invalid) {
      this.salaryForm.markAllAsTouched();
      this.errorMessage = 'Vui lòng chọn nhân sự/tài xế và kiểm tra các trường bắt buộc (*) !';
      return;
    }

    this.loading = true;
    const val = { ...this.salaryForm.getRawValue() };

    val.salaryBasicCosts = this.parseCommasToNumber(this.formattedBasicCosts);
    val.salaryBasicPerDay = this.parseCommasToNumber(this.formattedBasicPerDay);
    val.driverShipmentRevenue = this.parseCommasToNumber(this.formattedDriverRevenue);
    val.allowanceCosts = this.parseCommasToNumber(this.formattedAllowanceCosts);
    val.deductionCosts = this.parseCommasToNumber(this.formattedDeductionCosts);
    val.salaryCosts = this.parseCommasToNumber(this.formattedTotalSalaryCosts);

    // Attach shipment IDs & vehicle IDs from auto-loaded list
    val.shipmentIds = this.driverShipmentsInRange.map(s => s.shipmentId);
    val.vehicleIds = this.vehicleOptions.map(v => v.vehicleId);

    if (this.isEditSalaryMode && this.selectedSalary) {
      this.payrollService.updateSalary(this.selectedSalary.salaryId, val).subscribe({
        next: (res) => {
          this.loading = false;
          this.showSuccess(res.message || 'Thao tác thành công');
          this.closeSalaryModal();
          this.loadSalaries();
        },
        error: (err) => {
          this.loading = false;
          this.showError(err.error?.message || 'Thao tác thất bại');
        }
      });
    } else {
      this.payrollService.createSalary(val).subscribe({
        next: (res) => {
          this.loading = false;
          this.showSuccess(res.message || 'Thao tác thành công');
          this.closeSalaryModal();
          this.loadSalaries();
        },
        error: (err) => {
          this.loading = false;
          this.showError(err.error?.message || 'Thao tác thất bại');
        }
      });
    }
  }

  onDeleteSalary(s: SalaryModel): void {
    this.clearAlerts();
    this.confirmDialog.confirm({
      title: 'Xóa Bảng Lương Nhân Sự',
      message: `Bạn có chắc chắn muốn xóa bảng tính lương "${s.salaryCode}" của nhân sự ${s.employeeName || ''}?`,
      confirmText: 'Đồng Ý Xóa',
      cancelText: 'Hủy Bỏ',
      type: 'danger',
      onConfirm: () => {
        this.loading = true;
        this.payrollService.deleteSalary(s.salaryId).subscribe({
          next: (res) => {
            this.loading = false;
            this.showSuccess(res.message || 'Thao tác thành công');
            this.loadSalaries();
          },
        });
      }
    });
  }

  onExportCurrentSalary(templateFile?: File | null): void {
    const salaryId = this.selectedSalary?.salaryId;
    const salaryCode = this.salaryForm.get('salaryCode')?.value || 'Salary';
    if (!salaryId) {
      this.showError('Không xác định được ID phiếu lương này để xuất file.');
      return;
    }
    this.reportExportService.exportSalaryById(salaryId, templateFile).subscribe({
      next: (blob) => {
        const filename = templateFile ? templateFile.name : `Phieu_Luong_${salaryCode}.xlsx`;
        this.reportExportService.downloadBlob(blob, filename);
        this.showSuccess(`Xuất phiếu lương "${salaryCode}" thành công!`);
      },
      error: () => {
        this.showError('Có lỗi xảy ra khi xuất phiếu lương.');
      }
    });
  }


  onExportSalaryRecord(salary: SalaryModel): void {
    if (!salary.salaryId) {
      this.showError('Không xác định được ID phiếu lương này.');
      return;
    }
    this.reportExportService.exportSalaryById(salary.salaryId).subscribe({
      next: (blob) => {
        const filename = `Phieu_Luong_${salary.salaryCode || salary.salaryId}.xlsx`;
        this.reportExportService.downloadBlob(blob, filename);
        this.showSuccess(`Xuất phiếu lương "${salary.salaryCode}" thành công!`);
      },
      error: () => {
        this.showError('Có lỗi xảy ra khi xuất phiếu lương.');
      }
    });
  }
}

