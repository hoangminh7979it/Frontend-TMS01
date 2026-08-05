import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RevenueFinalModel } from '@core/models/revenue.model';
import { VehicleModel } from '@core/models/vehicle.model';
import { ShipmentModel } from '@core/models/shipment.model';
import { ExpenseModel } from '@core/models/expense.model';
import { SalaryModel } from '@core/models/payroll.model';

@Component({
  selector: 'app-revenue-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './revenue-form.component.html',
  styleUrls: ['../revenue-list/revenue-list.component.css']
})
export class RevenueFormComponent {
  @Input() showModal: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() revenueForm!: FormGroup;
  @Input() vehicles: VehicleModel[] = [];
  @Input() scannedShipments: ShipmentModel[] = [];
  @Input() scannedExpenses: ExpenseModel[] = [];
  @Input() scannedSalaries: SalaryModel[] = [];
  @Input() autoScanLoading: boolean = false;
  @Input() errorMessage: string | null = null;
  @Input() loading: boolean = false;

  @Input() formattedGrossRevenue: string = '0';
  @Input() formattedTotalExpenses: string = '0';
  @Input() formattedTotalSalaries: string = '0';
  @Input() formattedNetProfit: string = '0';

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() vehicleOrDateChange = new EventEmitter<void>();
  @Output() autoScan = new EventEmitter<void>();

  @Output() grossRevenueInputChange = new EventEmitter<Event>();
  @Output() totalExpenseInputChange = new EventEmitter<Event>();
  @Output() totalSalaryInputChange = new EventEmitter<Event>();

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    this.save.emit();
  }

  onVehicleOrDateChanged(): void {
    this.vehicleOrDateChange.emit();
  }

  onAutoScanClicked(): void {
    this.autoScan.emit();
  }

  onGrossInput(event: Event): void {
    this.grossRevenueInputChange.emit(event);
  }

  onExpenseInput(event: Event): void {
    this.totalExpenseInputChange.emit(event);
  }

  onSalaryInput(event: Event): void {
    this.totalSalaryInputChange.emit(event);
  }
}
