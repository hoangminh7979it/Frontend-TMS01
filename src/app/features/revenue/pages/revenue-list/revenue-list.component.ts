import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RevenueService } from '@core/services/revenue.service';
import { ExpenseService } from '@core/services/expense.service';
import { PayrollService } from '@core/services/payroll.service';
import { ShipmentService } from '@core/services/shipment.service';
import { VehicleService } from '@core/services/vehicle.service';
import { EmployeeService } from '@core/services/employee.service';
import { ConfirmDialogService } from '@core/services/confirm-dialog.service';
import { RevenueFormComponent } from '../revenue-form/revenue-form.component';
import { RevenueFinalModel, RevenueSummaryModel } from '@core/models/revenue.model';
import { VehicleModel } from '@core/models/vehicle.model';
import { EmployeeModel } from '@core/models/employee.model';
import { ShipmentModel } from '@core/models/shipment.model';
import { ExpenseModel } from '@core/models/expense.model';
import { SalaryModel } from '@core/models/payroll.model';
import { ReportExportService } from '@core/services/report-export.service';

import { PaginationComponent } from '@shared/components/pagination/pagination.component';

@Component({
  selector: 'app-revenue-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RevenueFormComponent, PaginationComponent],
  templateUrl: './revenue-list.component.html',
  styleUrls: ['./revenue-list.component.css']
})



export class RevenueListComponent implements OnInit {

  loading: boolean = false;
  showExportModal: boolean = false;

  autoScanLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Data State
  revenues: RevenueFinalModel[] = [];
  filteredRevenues: RevenueFinalModel[] = [];
  summaryData: RevenueSummaryModel | null = null;
  vehicles: VehicleModel[] = [];

  // Scanned breakdown data by selected vehicle
  scannedShipments: ShipmentModel[] = [];
  scannedExpenses: ExpenseModel[] = [];
  scannedSalaries: SalaryModel[] = [];

  // Filter State
  searchQuery: string = '';
  selectedDriverFilter: number | null = null;
  selectedVehicleFilter: number | null = null;
  drivers: EmployeeModel[] = [];

  // Pagination State
  paginatedRevenues: RevenueFinalModel[] = [];
  currentPage: number = 1;
  pageSize: number = 10;


  // Modal State - Revenue Final Report
  showRevenueModal: boolean = false;
  isEditRevenueMode: boolean = false;
  selectedRevenue: RevenueFinalModel | null = null;
  revenueForm!: FormGroup;

  // Formatted Financial Inputs State
  formattedGrossRevenue: string = '0';
  formattedTotalExpenses: string = '0';
  formattedTotalSalaries: string = '0';
  formattedNetProfit: string = '0';

  constructor(
    private fb: FormBuilder,
    private revenueService: RevenueService,
    private expenseService: ExpenseService,
    private payrollService: PayrollService,
    private shipmentService: ShipmentService,
    private vehicleService: VehicleService,
    private employeeService: EmployeeService,
    private confirmDialog: ConfirmDialogService,
    private reportExportService: ReportExportService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadVehicles();
    this.loadDrivers();
    this.loadRevenueSummary();
    this.loadRevenues();
  }

  loadDrivers(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.drivers = res.data.filter(e => e.employeeTypeCode === 'DRIVER' || e.employeeTypeName?.toLowerCase().includes('lái'));
        }
      }
    });
  }

  private initForm(): void {
    this.revenueForm = this.fb.group({
      revenueCode: ['', [Validators.required]],
      title: ['', [Validators.required]],
      vehicleId: [null],
      startDate: [null],
      endDate: [null],
      totalShipment: [0],
      grossRevenue: [0],
      totalExpense: [0],
      totalSalary: [0],
      revenueFinalCosts: [0],
      notes: ['']
    });
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

  // --- FINANCIAL CALCULATIONS ---
  onGrossRevenueInput(event: any): void {
    const num = this.parseCommasToNumber(event.target.value);
    this.formattedGrossRevenue = num > 0 ? num.toLocaleString('en-US') : (event.target.value === '' ? '' : '0');
    this.revenueForm.patchValue({ grossRevenue: num });
    this.recalculateNetProfit();
  }

  onTotalExpenseInput(event: any): void {
    const num = this.parseCommasToNumber(event.target.value);
    this.formattedTotalExpenses = num > 0 ? num.toLocaleString('en-US') : (event.target.value === '' ? '' : '0');
    this.revenueForm.patchValue({ totalExpense: num });
    this.recalculateNetProfit();
  }

  onTotalSalaryInput(event: any): void {
    const num = this.parseCommasToNumber(event.target.value);
    this.formattedTotalSalaries = num > 0 ? num.toLocaleString('en-US') : (event.target.value === '' ? '' : '0');
    this.revenueForm.patchValue({ totalSalary: num });
    this.recalculateNetProfit();
  }

  recalculateNetProfit(): void {
    const gross = this.parseCommasToNumber(this.formattedGrossRevenue);
    const expenses = this.parseCommasToNumber(this.formattedTotalExpenses);
    const salaries = this.parseCommasToNumber(this.formattedTotalSalaries);

    const net = gross - expenses - salaries;
    this.formattedNetProfit = net.toLocaleString('en-US');
    this.revenueForm.patchValue({ revenueFinalCosts: net });
  }

  // --- DATA LOADING ---
  loadVehicles(): void {
    this.vehicleService.getAllVehicles().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.vehicles = res.data;
        }
      }
    });
  }

  loadRevenueSummary(): void {
    this.revenueService.getRevenueSummary().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.summaryData = res.data;
          this.calculateMetrics();
        }
      }
    });
  }

  private calculateMetrics(): void {
    if (!this.revenues || this.revenues.length === 0) return;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const currentMonthRevenues = this.revenues.filter(r => {
      if (!r.startDate) return false;
      const d = new Date(r.startDate);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const totalGrossRevenue = currentMonthRevenues.reduce((sum, r) => sum + (r.grossRevenue || 0), 0);
    const totalExpenses = currentMonthRevenues.reduce((sum, r) => sum + (r.totalExpense || 0), 0);
    const totalSalariesPaid = currentMonthRevenues.reduce((sum, r) => sum + (r.totalSalary || 0), 0);
    const totalNetProfit = currentMonthRevenues.reduce((sum, r) => sum + (r.revenueFinalCosts || 0), 0);

    this.summaryData = {
      totalGrossRevenue,
      totalExpenses,
      totalSalariesPaid,
      netProfit: totalNetProfit,
      totalShipmentsCompleted: currentMonthRevenues.reduce((sum, r) => sum + (r.totalShipment || 0), 0),
      activeDriversCount: 0
    };

  }


  loadRevenues(): void {
    this.loading = true;
    this.revenueService.getAllRevenues().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.revenues = res.data;
          this.calculateMetrics();
          this.applyFilter();
        }

      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Không thể tải danh sách báo cáo chốt doanh thu.';
      }
    });
  }

  applyFilter(): void {
    let result = [...this.revenues];

    if (this.selectedVehicleFilter) {
      const selectedV = this.vehicles.find(v => v.id === Number(this.selectedVehicleFilter));
      if (selectedV && selectedV.licensePlate) {
        const plate = selectedV.licensePlate.toLowerCase();
        result = result.filter(r => 
          (r.vehicleId === selectedV.id) ||
          (r.licensePlate && r.licensePlate.toLowerCase() === plate)
        );
      }
    }

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(r =>
        (r.revenueCode && r.revenueCode.toLowerCase().includes(q)) ||
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.licensePlate && r.licensePlate.toLowerCase().includes(q)) ||
        (r.notes && r.notes.toLowerCase().includes(q))
      );
    }
    this.filteredRevenues = result;
    this.currentPage = 1;
    this.updatePaginatedRevenues();
  }

  updatePaginatedRevenues(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedRevenues = this.filteredRevenues.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedRevenues();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updatePaginatedRevenues();
  }


  onSearchChange(): void {
    this.applyFilter();
  }

  // --- VEHICLE SELECTION OR DATE CHANGE LISTENER ---
  onVehicleOrDateChange(): void {
    this.autoScanPeriodFinancials();
  }

  // --- AUTO SCAN FINANCIALS BASED ON VEHICLE & DATE RANGE ---
  autoScanPeriodFinancials(): void {
    const selectedVehicleId = this.revenueForm.get('vehicleId')?.value ? Number(this.revenueForm.get('vehicleId')?.value) : null;
    const startDate = this.revenueForm.get('startDate')?.value;
    const endDate = this.revenueForm.get('endDate')?.value;

    const selectedVehicleObj = this.vehicles.find(v => v.id === selectedVehicleId);

    // Auto-update report title if vehicle is selected
    if (selectedVehicleObj) {
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const year = new Date().getFullYear();
      this.revenueForm.patchValue({
        title: `Báo cáo chốt doanh thu xe ${selectedVehicleObj.licensePlate} kỳ ${month}/${year}`
      });
    }

    this.autoScanLoading = true;
    this.scannedShipments = [];
    this.scannedExpenses = [];
    this.scannedSalaries = [];

    // Fetch all 3 modules in parallel / chain
    this.shipmentService.getAllShipments().subscribe({
      next: (shipRes) => {
        let shipments = shipRes.data || [];
        
        // Chỉ lấy chuyến hàng nếu ĐÃ CHỌN PHƯƠNG TIỆN
        if (selectedVehicleId) {
          shipments = shipments.filter(s => s.vehicleId === selectedVehicleId);
          if (startDate) {
            shipments = shipments.filter(s => s.dateOfReceipt && s.dateOfReceipt >= startDate);
          }
          if (endDate) {
            shipments = shipments.filter(s => s.dateOfReceipt && s.dateOfReceipt <= endDate + 'T23:59:59');
          }
        } else {
          shipments = [];
        }

        this.scannedShipments = shipments;

        const totalGross = shipments.reduce((sum, s) => sum + (s.revenue || 0), 0);
        this.formattedGrossRevenue = totalGross.toLocaleString('en-US');
        this.revenueForm.patchValue({ 
          grossRevenue: totalGross,
          totalShipment: shipments.length 
        });

        // Chi Phí Vận Hành Xe: Chỉ nạp khi ĐÃ CHỌN PHƯƠNG TIỆN
        this.expenseService.getAllExpenses().subscribe({
          next: (expRes) => {
            let expenses = expRes.data || [];
            if (selectedVehicleId) {
              expenses = expenses.filter(e => e.vehicleId === selectedVehicleId);
              if (startDate) {
                expenses = expenses.filter(e => e.expenseDate && e.expenseDate >= startDate);
              }
              if (endDate) {
                expenses = expenses.filter(e => e.expenseDate && e.expenseDate <= endDate + 'T23:59:59');
              }
            } else {
              expenses = [];
            }

            // Nếu có chi phí phát sinh từ các chuyến hàng (Shipment incurredCosts), tự động thêm dòng chi phí "Phí Đường Bộ & Cầu Đường" vào danh sách chi phí quét được
            const shipmentIncurredSum = shipments.reduce((sum, s) => sum + (s.incurredCosts || 0), 0);
            if (shipmentIncurredSum > 0 && selectedVehicleObj && selectedVehicleId) {
              const tollExpenseItem: ExpenseModel = {
                expenseId: 0,
                expenseCode: 'SYNC-SHIPMENT',
                title: `Phí Đường Bộ & Cầu Đường (${shipments.length} chuyến hàng)`,
                vehicleId: selectedVehicleId,
                vehicleLicensePlate: selectedVehicleObj.licensePlate,
                totalExpense: shipmentIncurredSum,
                expenseDate: endDate || new Date().toISOString().substring(0, 10),
                notes: 'Tự động sync từ Chi Phí Phát Sinh / Cầu Đường của các chuyến hàng Shipment'
              };
              expenses = [tollExpenseItem, ...expenses];
            }

            this.scannedExpenses = expenses;


            const totalExp = expenses.reduce((sum, e) => sum + (e.totalExpense || 0), 0);

            this.formattedTotalExpenses = totalExp.toLocaleString('en-US');
            this.revenueForm.patchValue({ totalExpense: totalExp });



            // Phiếu Lương Nhân Sự: Chỉ nạp khi ĐÃ CHỌN PHƯƠNG TIỆN
            this.payrollService.getAllSalaries().subscribe({
              next: (salRes) => {
                this.autoScanLoading = false;
                let salaries = salRes.data || [];
                let calculatedVehicleSalaryTotal = 0;
                let matchingSalaries: SalaryModel[] = [];

                if (selectedVehicleId && selectedVehicleObj) {
                  const vehicleShipmentCodes = new Set(shipments.map(s => s.shipmentCode));

                  salaries.forEach(sal => {
                    const hasVehicleMatch =
                      (sal.licensePlates && sal.licensePlates.some(lp => lp.toLowerCase() === selectedVehicleObj.licensePlate.toLowerCase())) ||
                      (sal.shipmentCodes && sal.shipmentCodes.some(code => vehicleShipmentCodes.has(code)));

                    if (hasVehicleMatch) {
                      if (startDate && sal.startDate && sal.startDate < startDate) return;
                      if (endDate && sal.endDate && sal.endDate > endDate) return;

                      matchingSalaries.push(sal);

                      const tripPercent = sal.tripSalaryPercentage || 0;
                      if (tripPercent > 0) {
                        const vehicleShipmentsForSalary = shipments.filter(s => 
                          s.vehicleId === selectedVehicleId && 
                          (!sal.shipmentCodes || sal.shipmentCodes.length === 0 || sal.shipmentCodes.includes(s.shipmentCode))
                        );
                        const vehicleRevForSalary = vehicleShipmentsForSalary.reduce((sum, s) => sum + (s.revenue || 0), 0);
                        const allocatedTripSalary = (vehicleRevForSalary * tripPercent) / 100;
                        calculatedVehicleSalaryTotal += Math.round(allocatedTripSalary);
                      } else {
                        calculatedVehicleSalaryTotal += (sal.salaryCosts || 0);
                      }
                    }
                  });
                }

                this.scannedSalaries = matchingSalaries;
                this.formattedTotalSalaries = calculatedVehicleSalaryTotal.toLocaleString('en-US');
                this.revenueForm.patchValue({ totalSalary: calculatedVehicleSalaryTotal });

                this.recalculateNetProfit();
              },
              error: () => { this.autoScanLoading = false; }
            });
          },
          error: () => { this.autoScanLoading = false; }
        });
      },
      error: () => { this.autoScanLoading = false; }
    });
  }

  // --- REVENUE MODAL HANDLERS ---
  openCreateRevenueModal(): void {
    this.clearAlerts();
    this.isEditRevenueMode = false;
    this.selectedRevenue = null;
    this.scannedShipments = [];
    this.scannedExpenses = [];
    this.scannedSalaries = [];

    this.revenueForm.reset();

    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    let num = this.revenues.length + 1;
    let nextCode = `DT-${year}${month}-${num.toString().padStart(3, '0')}`;
    const existingCodes = new Set(this.revenues.map(r => r.revenueCode?.toUpperCase()));
    while (existingCodes.has(nextCode.toUpperCase())) {
      num++;
      nextCode = `DT-${year}${month}-${num.toString().padStart(3, '0')}`;
    }

    this.revenueForm.patchValue({
      revenueCode: nextCode,
      title: `Báo cáo chốt doanh thu & lợi nhuận kỳ ${month}/${year}`,
      vehicleId: null,
      totalShipment: 0
    });


    this.autoScanPeriodFinancials();

    this.revenueForm.controls['revenueCode'].enable();
    this.showRevenueModal = true;
  }

  openEditRevenueModal(r: RevenueFinalModel): void {
    this.clearAlerts();
    this.isEditRevenueMode = true;
    this.selectedRevenue = r;

    this.formattedGrossRevenue = this.formatNumberWithCommas(r.grossRevenue || 0);
    this.formattedTotalExpenses = this.formatNumberWithCommas(r.totalExpense || 0);
    this.formattedTotalSalaries = this.formatNumberWithCommas(r.totalSalary || 0);
    this.formattedNetProfit = this.formatNumberWithCommas(r.revenueFinalCosts || 0);

    this.revenueForm.patchValue({
      revenueCode: r.revenueCode,
      title: r.title,
      vehicleId: r.vehicleId || null,
      startDate: r.startDate,
      endDate: r.endDate,
      totalShipment: r.totalShipment || 0,
      grossRevenue: r.grossRevenue || 0,
      totalExpense: r.totalExpense || 0,
      totalSalary: r.totalSalary || 0,
      revenueFinalCosts: r.revenueFinalCosts || 0,
      notes: r.notes
    });

    this.revenueForm.controls['revenueCode'].disable();
    this.showRevenueModal = true;

    // Scan & display linked shipments, expenses & salaries for selected revenue report
    this.autoScanPeriodFinancials();
  }


  closeRevenueModal(): void {
    this.showRevenueModal = false;
  }

  onSaveRevenue(): void {
    this.clearAlerts();
    if (this.revenueForm.invalid) {
      this.revenueForm.markAllAsTouched();
      this.errorMessage = 'Vui lòng kiểm tra và nhập đầy đủ Mã và Tiêu đề báo cáo (*) !';
      return;
    }

    this.loading = true;
    const val = { ...this.revenueForm.getRawValue() };

    val.grossRevenue = this.parseCommasToNumber(this.formattedGrossRevenue);
    val.totalExpense = this.parseCommasToNumber(this.formattedTotalExpenses);
    val.totalSalary = this.parseCommasToNumber(this.formattedTotalSalaries);
    val.revenueFinalCosts = this.parseCommasToNumber(this.formattedNetProfit);
    val.shipmentIds = this.scannedShipments.map(s => s.shipmentId);

    if (this.isEditRevenueMode && this.selectedRevenue) {
      this.revenueService.updateRevenue(this.selectedRevenue.revenueId, val).subscribe({
        next: (res) => {
          this.loading = false;
          this.showSuccess(res.message || 'Thao tác thành công');
          this.closeRevenueModal();
          this.loadRevenues();
          this.loadRevenueSummary();
        },
        error: (err) => {
          this.loading = false;
          this.showError(err.error?.message || 'Thao tác thất bại');
        }
      });
    } else {
      this.revenueService.createRevenue(val).subscribe({
        next: (res) => {
          this.loading = false;
          this.showSuccess(res.message || 'Thao tác thành công');
          this.closeRevenueModal();
          this.loadRevenues();
          this.loadRevenueSummary();
        },
        error: (err) => {
          this.loading = false;
          this.showError(err.error?.message || 'Thao tác thất bại');
        }
      });
    }
  }

  onDeleteRevenue(r: RevenueFinalModel): void {
    this.clearAlerts();
    this.confirmDialog.confirm({
      title: 'Xóa Báo Cáo Doanh Thu',
      message: `Bạn có chắc chắn muốn xóa báo cáo chốt doanh thu "${r.revenueCode}" (${r.title})?`,
      confirmText: 'Đồng Ý Xóa',
      cancelText: 'Hủy Bỏ',
      type: 'danger',
      onConfirm: () => {
        this.loading = true;
        this.revenueService.deleteRevenue(r.revenueId).subscribe({
          next: (res) => {
            this.loading = false;
            this.showSuccess(res.message || 'Thao tác thành công');
            this.loadRevenues();
            this.loadRevenueSummary();
          },
        });
      }
    });
  }

  onExportCurrentRevenue(templateFile?: File | null): void {
    const revenueId = this.selectedRevenue?.revenueId;
    const revenueCode = this.revenueForm.get('revenueCode')?.value || 'Revenue';
    if (!revenueId) {
      this.showError('Không xác định được ID báo cáo doanh thu để xuất file.');
      return;
    }
    this.reportExportService.exportRevenueById(revenueId, templateFile).subscribe({
      next: (blob) => {
        const filename = templateFile ? templateFile.name : `Bao_Cao_Chot_Doanh_Thu_${revenueCode}.xlsx`;
        this.reportExportService.downloadBlob(blob, filename);
        this.showSuccess(`Xuất báo cáo doanh thu "${revenueCode}" thành công!`);
      },
      error: () => {
        this.showError('Có lỗi xảy ra khi xuất báo cáo doanh thu.');
      }
    });
  }


  onExportRevenueRecord(r: RevenueFinalModel): void {
    if (!r.revenueId) {
      this.showError('Không xác định được ID báo cáo doanh thu này.');
      return;
    }
    this.reportExportService.exportRevenueById(r.revenueId).subscribe({
      next: (blob) => {
        const filename = `Bao_Cao_Chot_Doanh_Thu_${r.revenueCode || r.revenueId}.xlsx`;
        this.reportExportService.downloadBlob(blob, filename);
        this.showSuccess(`Xuất báo cáo doanh thu "${r.revenueCode}" thành công!`);
      },
      error: () => {
        this.showError('Có lỗi xảy ra khi xuất báo cáo doanh thu.');
      }
    });
  }
}




