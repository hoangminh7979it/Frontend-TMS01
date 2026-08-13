import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ExpenseService } from '@core/services/expense.service';
import { VehicleService } from '@core/services/vehicle.service';
import { EmployeeService } from '@core/services/employee.service';
import { ShipmentService } from '@core/services/shipment.service';
import { ConfirmDialogService } from '@core/services/confirm-dialog.service';
import { ExpenseFormComponent } from '../expense-form/expense-form.component';
import { ExpenseModel, ExpenseTypeModel } from '@core/models/expense.model';
import { VehicleModel } from '@core/models/vehicle.model';
import { EmployeeModel } from '@core/models/employee.model';
import { ShipmentModel } from '@core/models/shipment.model';

export interface DetailRow {
  expenseTypeId: number | null;
  formattedCost: string;
  date: string;
  description: string;
}

import { ReportExportModalComponent } from '@shared/components/report-export-modal/report-export-modal.component';
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
  ExcelImportModalComponent
} from '@shared-ui';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ExpenseFormComponent,
    ReportExportModalComponent,
    PaginationComponent,
    ExcelImportModalComponent,
    TmsPageHeaderComponent,
    TmsMetricCardComponent,
    TmsTablePanelComponent,
    TmsSearchBoxComponent,
    TmsToastComponent
  ],
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.css']
})


export class ExpenseListComponent implements OnInit {

  activeTab: 'expenses' | 'types' = 'expenses';
  loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Data State
  expenses: ExpenseModel[] = [];
  filteredExpenses: ExpenseModel[] = [];
  expenseTypes: ExpenseTypeModel[] = [];
  vehicles: VehicleModel[] = [];
  drivers: EmployeeModel[] = [];
  shipments: ShipmentModel[] = [];

  // Filter State
  searchQuery: string = '';
  selectedTypeFilter: string = 'ALL';
  selectedDriverFilter: number | null = null;
  selectedVehicleFilter: number | null = null;

  // Pagination State
  paginatedExpenses: ExpenseModel[] = [];
  currentPage: number = 1;
  pageSize: number = 10;


  // Modal State - Expense
  showExpenseModal: boolean = false;
  showExportModal: boolean = false;

  isEditExpenseMode: boolean = false;
  selectedExpense: ExpenseModel | null = null;
  expenseForm!: FormGroup;

  // Formatted Financial Inputs State
  formattedTotalExpense: string = '0';

  // Dynamic Detail Rows State
  detailRows: DetailRow[] = [];

  // Modal State - Expense Type Category
  showTypeModal: boolean = false;
  isEditTypeMode: boolean = false;
  selectedTypeItem: ExpenseTypeModel | null = null;
  typeForm!: FormGroup;

  // KPI Metrics
  totalExpenseAmount: number = 0;
  fuelExpenseAmount: number = 0;
  tollExpenseAmount: number = 0;
  repairExpenseAmount: number = 0;

  showImportExcelModal: boolean = false;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private vehicleService: VehicleService,
    private employeeService: EmployeeService,
    private shipmentService: ShipmentService,
    private confirmDialog: ConfirmDialogService,
    private reportExportService: ReportExportService,
    private toastService: ToastService,
    private excelService: ExcelImportExportService
  ) {}

  onDownloadExcelTemplate(): void {
    this.excelService.downloadTemplate('expenses');
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
        expenseCode: r.expenseCode,
        title: r.title,
        totalExpense: r.totalExpense ? Number(r.totalExpense) : 0,
        vehicleLicensePlate: r.vehicleLicensePlate || '',
        notes: r.notes || ''
      };

      if (r.expenseDate) payload.expenseDate = r.expenseDate;

      return this.expenseService.createExpense(payload).toPromise()
        .then(() => { successCount++; })
        .catch(() => { failCount++; });
    });

    Promise.all(promises).then(() => {
      this.loading = false;
      this.loadExpenses();
      if (successCount > 0) {
        this.toastService.success(`Đã nhập thành công ${successCount} phiếu chi từ file Excel!`);
      }
      if (failCount > 0) {
        this.toastService.warning(`Có ${failCount} dòng không nhập được do trùng mã phiếu hoặc lỗi dữ liệu.`);
      }
    });
  }

  ngOnInit(): void {
    this.initForms();
    this.loadExpenseTypes();
    this.loadVehicles();
    this.loadDrivers();
    this.loadShipments();
    this.loadExpenses();
  }

  private initForms(): void {
    this.expenseForm = this.fb.group({
      expenseCode: ['', [Validators.required]],
      title: ['', [Validators.required]],
      expenseDate: [null],
      totalExpense: [0],
      vehicleId: [null],
      vehicleLicensePlate: [''],
      notes: ['']
    });

    this.typeForm = this.fb.group({
      expenseTypeCode: ['', [Validators.required]],
      expenseTypeName: ['', [Validators.required]],
      description: ['']
    });
  }

  setActiveTab(tab: 'expenses' | 'types'): void {
    this.activeTab = tab;
    this.clearAlerts();
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
    const digitsOnly = val.toString().replace(/\D/g, '');
    if (!digitsOnly) return '0';
    return Number(digitsOnly).toLocaleString('en-US');
  }

  parseCommasToNumber(val: string): number {
    if (!val) return 0;
    const digitsOnly = val.toString().replace(/\D/g, '');
    return digitsOnly ? Number(digitsOnly) : 0;
  }

  onTotalExpenseInput(event: any): void {
    const rawVal = event.target.value;
    const num = this.parseCommasToNumber(rawVal);
    this.formattedTotalExpense = num > 0 ? num.toLocaleString('en-US') : (rawVal === '' ? '' : '0');
    this.expenseForm.patchValue({ totalExpense: num });
  }

  onDetailCostInput(index: number, event: any): void {
    const rawVal = event.target.value;
    const num = this.parseCommasToNumber(rawVal);
    this.detailRows[index].formattedCost = num > 0 ? num.toLocaleString('en-US') : (rawVal === '' ? '' : '0');
    this.recalculateTotalFromDetails();
  }

  recalculateTotalFromDetails(): void {
    let sum = 0;
    for (const row of this.detailRows) {
      sum += this.parseCommasToNumber(row.formattedCost);
    }
    this.formattedTotalExpense = sum > 0 ? sum.toLocaleString('en-US') : '0';
    this.expenseForm.patchValue({ totalExpense: sum });
  }

  // --- DYNAMIC DETAIL ROWS HANDLERS ---
  addDetailRow(): void {
    const today = new Date().toISOString().substring(0, 10);
    this.detailRows.push({
      expenseTypeId: this.expenseTypes.length > 0 ? this.expenseTypes[0].expenseTypeId : null,
      formattedCost: '0',
      date: today,
      description: ''
    });
  }

  removeDetailRow(index: number): void {
    if (this.detailRows.length > 1) {
      this.detailRows.splice(index, 1);
    } else {
      this.detailRows[0] = {
        expenseTypeId: this.expenseTypes.length > 0 ? this.expenseTypes[0].expenseTypeId : null,
        formattedCost: '0',
        date: new Date().toISOString().substring(0, 10),
        description: ''
      };
    }
    this.recalculateTotalFromDetails();
  }

  trackByIndex(index: number): number {
    return index;
  }

  // --- DATA LOADING ---
  loadExpenseTypes(): void {
    this.expenseService.getAllExpenseTypes().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.expenseTypes = res.data;
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
          this.drivers = res.data;
        }
      }
    });
  }

  loadShipments(): void {
    this.shipmentService.getAllShipments().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.shipments = res.data;
        }
      }
    });
  }

  loadExpenses(): void {
    this.loading = true;
    this.expenseService.getAllExpenses().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.expenses = res.data;
          this.calculateMetrics();
          this.applyFilter();
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Không thể tải danh sách phiếu chi phí vận tải.';
      }
    });
  }

  private calculateMetrics(): void {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const currentMonthExpenses = this.expenses.filter(e => {
      if (!e.expenseDate) return false;
      const d = new Date(e.expenseDate);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    this.totalExpenseAmount = currentMonthExpenses.reduce((sum, e) => sum + (e.totalExpense || 0), 0);
    
    let fuelSum = 0;
    let tollSum = 0;
    let repairSum = 0;

    for (const exp of currentMonthExpenses) {
      if (exp.details) {
        for (const dt of exp.details) {
          const cost = dt.expenseDetailCosts || 0;
          if (dt.expenseTypeCode === 'FUEL') fuelSum += cost;
          else if (dt.expenseTypeCode === 'TOLL') tollSum += cost;
          else if (dt.expenseTypeCode === 'REPAIR') repairSum += cost;
        }
      }
    }

    this.fuelExpenseAmount = fuelSum;
    this.tollExpenseAmount = tollSum;
    this.repairExpenseAmount = repairSum;
  }


  applyFilter(): void {
    let result = [...this.expenses];

    if (this.selectedTypeFilter && this.selectedTypeFilter !== 'ALL') {
      result = result.filter(e => 
        e.details && e.details.some(d => d.expenseTypeCode === this.selectedTypeFilter)
      );
    }

    if (this.selectedDriverFilter) {
      result = result.filter(e => e.employeeId === Number(this.selectedDriverFilter));
    }

    if (this.selectedVehicleFilter) {
      result = result.filter(e => e.vehicleId === Number(this.selectedVehicleFilter));
    }

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(e => 
        (e.expenseCode && e.expenseCode.toLowerCase().includes(q)) ||
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.vehicleLicensePlate && e.vehicleLicensePlate.toLowerCase().includes(q)) ||
        (e.employeeName && e.employeeName.toLowerCase().includes(q)) ||
        (e.shipmentCode && e.shipmentCode.toLowerCase().includes(q)) ||
        (e.notes && e.notes.toLowerCase().includes(q))
      );
    }

    this.filteredExpenses = result;
    this.currentPage = 1;
    this.updatePaginatedExpenses();
  }

  updatePaginatedExpenses(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedExpenses = this.filteredExpenses.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedExpenses();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updatePaginatedExpenses();
  }


  onSearchChange(): void {
    this.applyFilter();
  }

  onTypeFilterChange(typeCode: string): void {
    this.selectedTypeFilter = typeCode;
    this.applyFilter();
  }

  // --- AUTOMATICALLY SUM SHIPMENT INCURRED COSTS WHEN VEHICLE IS SELECTED ---
  onVehicleChange(event: any): void {
    const vId = event.target.value ? Number(event.target.value) : null;
    if (!vId) return;

    const v = this.vehicles.find(item => item.id === vId);
    if (!v) return;

    this.expenseForm.patchValue({
      vehicleLicensePlate: v.licensePlate
    });
  }


  // --- EXPENSE MODAL HANDLERS ---
  openCreateExpenseModal(): void {
    this.clearAlerts();
    this.isEditExpenseMode = false;
    this.selectedExpense = null;
    this.formattedTotalExpense = '0';

    const today = new Date().toISOString().substring(0, 10);
    this.detailRows = [{
      expenseTypeId: this.expenseTypes.length > 0 ? this.expenseTypes[0].expenseTypeId : null,
      formattedCost: '0',
      date: today,
      description: ''
    }];

    this.expenseForm.reset();

    const year = new Date().getFullYear();
    let num = this.expenses.length + 1;
    let nextCode = `CP-${year}-${num.toString().padStart(3, '0')}`;
    const existingCodes = new Set(this.expenses.map(e => e.expenseCode?.toUpperCase()));
    while (existingCodes.has(nextCode.toUpperCase())) {
      num++;
      nextCode = `CP-${year}-${num.toString().padStart(3, '0')}`;
    }

    this.expenseForm.patchValue({
      expenseCode: nextCode,
      title: `Phiếu chi phí vận tải ${num.toString().padStart(3, '0')}`,
      expenseDate: today,
      totalExpense: 0
    });

    this.expenseForm.controls['expenseCode'].enable();
    this.showExpenseModal = true;
  }

  openEditExpenseModal(e: ExpenseModel): void {
    this.clearAlerts();
    this.isEditExpenseMode = true;
    this.selectedExpense = e;

    this.formattedTotalExpense = this.formatNumberWithCommas(e.totalExpense || 0);

    const expDateStr = e.expenseDate ? e.expenseDate.substring(0, 10) : null;

    // Load detail rows
    if (e.details && e.details.length > 0) {
      this.detailRows = e.details.map(d => ({
        expenseTypeId: d.expenseTypeId || null,
        formattedCost: this.formatNumberWithCommas(d.expenseDetailCosts || 0),
        date: d.date || (expDateStr || new Date().toISOString().substring(0, 10)),
        description: d.description || ''
      }));
    } else {
      this.detailRows = [{
        expenseTypeId: this.expenseTypes.length > 0 ? this.expenseTypes[0].expenseTypeId : null,
        formattedCost: this.formatNumberWithCommas(e.totalExpense || 0),
        date: expDateStr || new Date().toISOString().substring(0, 10),
        description: e.notes || ''
      }];
    }

    this.expenseForm.patchValue({
      expenseCode: e.expenseCode,
      title: e.title,
      expenseDate: expDateStr,
      totalExpense: e.totalExpense,
      vehicleId: e.vehicleId,
      vehicleLicensePlate: e.vehicleLicensePlate,
      notes: e.notes
    });
    this.expenseForm.controls['expenseCode'].disable();
    this.showExpenseModal = true;
  }

  closeExpenseModal(): void {
    this.showExpenseModal = false;
  }

  onSaveExpense(): void {
    this.clearAlerts();

    if (this.expenseForm.invalid) {
      this.shipmentFormMarkTouched();
      this.errorMessage = 'Vui lòng kiểm tra và nhập đầy đủ các trường bắt buộc (*) như Mã Phiếu và Tiêu Đề!';
      return;
    }

    this.loading = true;

    // Map dynamic details
    const mappedDetails = this.detailRows.map((row, idx) => ({
      expenseDetailCode: `${this.expenseForm.get('expenseCode')?.value}-DT${String(idx + 1).padStart(2, '0')}`,
      expenseTypeId: row.expenseTypeId ? Number(row.expenseTypeId) : undefined,
      expenseDetailCosts: this.parseCommasToNumber(row.formattedCost),
      date: row.date,
      description: row.description
    }));

    const val = { ...this.expenseForm.getRawValue() };

    // Format date string to ISO LocalDateTime for Spring Boot Jackson
    if (val.expenseDate && typeof val.expenseDate === 'string' && val.expenseDate.length === 10) {
      val.expenseDate = `${val.expenseDate}T00:00:00`;
    }

    val.totalExpense = this.parseCommasToNumber(this.formattedTotalExpense);
    if (val.vehicleId) val.vehicleId = Number(val.vehicleId);
    val.details = mappedDetails;

    if (this.isEditExpenseMode && this.selectedExpense) {
      this.expenseService.updateExpense(this.selectedExpense.expenseId, val).subscribe({
        next: (res) => {
          this.loading = false;
          this.showSuccess(res.message || 'Thao tác thành công');
          this.closeExpenseModal();
          this.loadExpenses();
        },
        error: (err) => {
          this.loading = false;
          this.showError(err.error?.message || err.error?.data || 'Thao tác thất bại');
        }
      });
    } else {
      this.expenseService.createExpense(val).subscribe({
        next: (res) => {
          this.loading = false;
          this.showSuccess(res.message || 'Thao tác thành công');
          this.closeExpenseModal();
          this.loadExpenses();
        },
        error: (err) => {
          this.loading = false;
          this.showError(err.error?.message || err.error?.data || 'Thao tác thất bại');
        }
      });
    }
  }

  private shipmentFormMarkTouched(): void {
    this.expenseForm.markAllAsTouched();
  }

  onDeleteExpense(e: ExpenseModel): void {
    this.clearAlerts();
    this.confirmDialog.confirm({
      title: 'Xóa Chứng Từ Chi Phí',
      message: `Bạn có chắc chắn muốn xóa phiếu chi phí "${e.expenseCode}" (${e.title || 'Phát sinh vận hành'})?`,
      confirmText: 'Đồng Ý Xóa',
      cancelText: 'Hủy Bỏ',
      type: 'danger',
      onConfirm: () => {
        this.loading = true;
        this.expenseService.deleteExpense(e.expenseId).subscribe({
          next: (res) => {
            this.loading = false;
            this.showSuccess(res.message || 'Thao tác thành công');
            this.loadExpenses();
          },
          error: (err) => {
            this.loading = false;
            this.showError(err.error?.message || err.error?.data || 'Thao tác thất bại');
          }
        });
      }
    });
  }

  // --- TYPE MODAL HANDLERS ---
  openCreateTypeModal(): void {
    this.clearAlerts();
    this.isEditTypeMode = false;
    this.selectedTypeItem = null;
    this.typeForm.reset();
    this.showTypeModal = true;
  }

  openEditTypeModal(t: ExpenseTypeModel): void {
    this.clearAlerts();
    this.isEditTypeMode = true;
    this.selectedTypeItem = t;
    this.typeForm.patchValue({
      expenseTypeCode: t.expenseTypeCode,
      expenseTypeName: t.expenseTypeName,
      description: t.description
    });
    this.showTypeModal = true;
  }

  closeTypeModal(): void {
    this.showTypeModal = false;
  }

  onSaveType(): void {
    this.clearAlerts();
    if (this.typeForm.invalid) {
      this.typeForm.markAllAsTouched();
      this.errorMessage = 'Vui lòng kiểm tra và nhập đầy đủ Mã & Tên loại chi phí (*) !';
      return;
    }

    this.loading = true;
    const val = this.typeForm.getRawValue();

    if (this.isEditTypeMode && this.selectedTypeItem) {
      this.expenseService.updateExpenseType(this.selectedTypeItem.expenseTypeId, val).subscribe({
        next: (res) => {
          this.loading = false;
          this.showSuccess(res.message || 'Thao tác thành công');
          this.closeTypeModal();
          this.loadExpenseTypes();
        },
        error: (err) => {
          this.loading = false;
          this.showError(err.error?.message || err.error?.data || 'Thao tác thất bại');
        }
      });
    } else {
      this.expenseService.createExpenseType(val).subscribe({
        next: (res) => {
          this.loading = false;
          this.showSuccess(res.message || 'Thao tác thành công');
          this.closeTypeModal();
          this.loadExpenseTypes();
        },
        error: (err) => {
          this.loading = false;
          this.showError(err.error?.message || err.error?.data || 'Thao tác thất bại');
        }
      });
    }
  }

  onDeleteType(t: ExpenseTypeModel): void {
    this.clearAlerts();
    this.confirmDialog.confirm({
      title: 'Xóa Loại Chi Phí',
      message: `Bạn có chắc chắn muốn xóa loại chi phí "${t.expenseTypeName}" (${t.expenseTypeCode})?`,
      confirmText: 'Đồng Ý Xóa',
      cancelText: 'Hủy Bỏ',
      type: 'danger',
      onConfirm: () => {
        this.loading = true;
        this.expenseService.deleteExpenseType(t.expenseTypeId).subscribe({
          next: (res) => {
            this.loading = false;
            this.showSuccess(res.message || 'Thao tác thành công');
            this.loadExpenseTypes();
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
    this.reportExportService.exportExpenses(options).subscribe({
      next: (blob) => {
        const ext = options.format || 'xlsx';
        this.reportExportService.downloadBlob(blob, `Bao_Cao_Chi_Phi_Expenses.${ext}`);
        this.showSuccess(`Xuất file báo cáo chi phí (${ext.toUpperCase()}) thành công!`);
      },
      error: () => {
        this.showError('Có lỗi xảy ra khi xuất file báo cáo chi phí.');
      }
    });
  }
}



