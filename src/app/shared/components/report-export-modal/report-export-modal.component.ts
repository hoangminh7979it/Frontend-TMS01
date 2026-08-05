import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehicleModel } from '@core/models/vehicle.model';
import { EmployeeModel } from '@core/models/employee.model';
import { ReportFilterOptions } from '@core/services/report-export.service';

@Component({
  selector: 'app-report-export-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-export-modal.component.html',
  styleUrls: ['./report-export-modal.component.css']
})
export class ReportExportModalComponent implements OnChanges {

  @Input() showModal: boolean = false;
  @Input() reportType: 'SHIPMENT' | 'EXPENSE' | 'SALARY' | 'REVENUE' = 'SHIPMENT';
  @Input() title: string = 'Tùy Chọn Lọc & Xuất Báo Cáo';

  @Input() vehicles: VehicleModel[] = [];
  @Input() employees: EmployeeModel[] = [];
  
  // Raw items for preview
  @Input() previewItems: any[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() confirmExport = new EventEmitter<ReportFilterOptions>();

  // Filter form state
  selectedVehicleId: number | null = null;
  selectedEmployeeId: number | null = null;
  startDate: string = '';
  endDate: string = '';
  exportFormat: 'xlsx' | 'pdf' = 'xlsx';

  filteredPreview: any[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showModal'] && this.showModal) {
      this.resetFilters();
    }
    this.applyPreviewFilter();
  }

  resetFilters(): void {
    this.selectedVehicleId = null;
    this.selectedEmployeeId = null;
    this.startDate = '';
    this.endDate = '';
    this.exportFormat = 'xlsx';
    this.applyPreviewFilter();
  }

  applyPreviewFilter(): void {
    if (!this.previewItems) {
      this.filteredPreview = [];
      return;
    }

    this.filteredPreview = this.previewItems.filter(item => {
      // Vehicle filter
      if (this.selectedVehicleId) {
        const vId = item.vehicleId || item.vehicle?.id || item.vehicle?.vehicleId;
        if (vId != this.selectedVehicleId) return false;
      }

      // Employee filter
      if (this.selectedEmployeeId) {
        const eId = item.employeeId || item.employee?.employeeId;
        if (eId != this.selectedEmployeeId) return false;
      }

      // Date range filter
      const itemDate = item.dateOfReceipt || item.expenseDate || item.startDate || item.createDate;
      if (itemDate) {
        const d = new Date(itemDate).getTime();
        if (this.startDate) {
          const s = new Date(this.startDate).getTime();
          if (d < s) return false;
        }
        if (this.endDate) {
          const e = new Date(this.endDate).getTime() + (24 * 60 * 60 * 1000 - 1);
          if (d > e) return false;
        }
      }

      return true;
    });
  }

  onFilterChange(): void {
    this.applyPreviewFilter();
  }

  onClose(): void {
    this.close.emit();
  }

  onExport(): void {
    this.confirmExport.emit({
      vehicleId: this.selectedVehicleId,
      employeeId: this.selectedEmployeeId,
      startDate: this.startDate || null,
      endDate: this.endDate || null,
      format: this.exportFormat
    });
  }
}
