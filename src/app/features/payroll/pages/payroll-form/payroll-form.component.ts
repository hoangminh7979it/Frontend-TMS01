import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { EmployeeModel, EmployeeTypeModel } from '@core/models/employee.model';
import { VehicleModel } from '@core/models/vehicle.model';
import { ShipmentModel } from '@core/models/shipment.model';

@Component({
  selector: 'app-payroll-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './payroll-form.component.html',
  styleUrls: ['../payroll-list/payroll-list.component.css']
})
export class PayrollFormComponent {
  @Input() showModal: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() salaryForm!: FormGroup;
  @Input() drivers: EmployeeModel[] = [];
  @Input() employeeTypes: EmployeeTypeModel[] = [];
  @Input() vehicles: VehicleModel[] = [];
  @Input() driverShipmentsInRange: ShipmentModel[] = [];
  @Input() vehicleOptions: { vehicleId: number; licensePlate: string; vehicleName: string }[] = [];
  @Input() shipmentLoading: boolean = false;

  @Input() formattedBasicCosts: string = '0';
  @Input() formattedBasicPerDay: string = '0';
  @Input() formattedAllowanceCosts: string = '0';
  @Input() formattedDeductionCosts: string = '0';
  @Input() formattedTotalSalaryCosts: string = '0';
  @Input() formattedDriverRevenue: string = '0';

  @Input() errorMessage: string | null = null;
  @Input() loading: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() export = new EventEmitter<File | null>();

  selectedTemplateFile: File | null = null;

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedTemplateFile = file;
    }
  }

  clearTemplateFile(fileInput: any): void {
    this.selectedTemplateFile = null;
    if (fileInput) fileInput.value = '';
  }


  @Output() startDateChange = new EventEmitter<void>();
  @Output() endDateChange = new EventEmitter<void>();
  @Output() driverChange = new EventEmitter<Event>();

  @Output() basicCostInput = new EventEmitter<Event>();
  @Output() workDaysInput = new EventEmitter<void>();
  @Output() basicPerDayInput = new EventEmitter<Event>();

  @Output() driverRevenueInput = new EventEmitter<Event>();
  @Output() tripPercentageInput = new EventEmitter<void>();
  @Output() allowanceInput = new EventEmitter<Event>();
  @Output() deductionInput = new EventEmitter<Event>();

  onClose(): void { this.close.emit(); }
  onSave(): void { this.save.emit(); }
  onExport(): void { this.export.emit(this.selectedTemplateFile); }


  onStartDateChanged(): void { this.startDateChange.emit(); }
  onEndDateChanged(): void { this.endDateChange.emit(); }
  onDriverChanged(event: Event): void { this.driverChange.emit(event); }

  onBasicCostInputted(event: Event): void { this.basicCostInput.emit(event); }
  onWorkDaysInputted(): void { this.workDaysInput.emit(); }
  onBasicPerDayInputted(event: Event): void { this.basicPerDayInput.emit(event); }

  onDriverRevenueInputted(event: Event): void { this.driverRevenueInput.emit(event); }
  onTripPercentageInputted(): void { this.tripPercentageInput.emit(); }
  onAllowanceInputted(event: Event): void { this.allowanceInput.emit(event); }
  onDeductionInputted(event: Event): void { this.deductionInput.emit(event); }
}
