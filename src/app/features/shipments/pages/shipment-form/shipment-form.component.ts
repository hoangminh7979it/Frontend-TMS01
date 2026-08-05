import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ShipmentModel, StatusEnumModel } from '@core/models/shipment.model';
import { CustomerModel, CompanyModel } from '@core/models/customer.model';
import { VehicleModel } from '@core/models/vehicle.model';
import { EmployeeModel } from '@core/models/employee.model';

@Component({
  selector: 'app-shipment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './shipment-form.component.html',
  styleUrls: ['../shipment-list/shipment-list.component.css']
})
export class ShipmentFormComponent {
  @Input() showModal: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() shipmentForm!: FormGroup;
  @Input() customers: CustomerModel[] = [];
  @Input() vehicles: VehicleModel[] = [];
  @Input() drivers: EmployeeModel[] = [];
  @Input() statuses: StatusEnumModel[] = [];
  @Input() companies: CompanyModel[] = [];
  
  @Input() receiptPlacesList: string[] = [''];
  @Input() deliveryPlacesList: string[] = [''];
  @Input() activeReceiptIndex: number | null = null;
  @Input() activeDeliveryIndex: number | null = null;
  @Input() useCustomDriver: boolean = false;

  @Input() formattedRevenue: string = '0';
  @Input() formattedIncurredCosts: string = '0';

  @Input() errorMessage: string | null = null;
  @Input() loading: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  @Output() addReceipt = new EventEmitter<void>();
  @Output() removeReceipt = new EventEmitter<number>();
  @Output() focusReceipt = new EventEmitter<number>();
  @Output() selectReceiptComp = new EventEmitter<{ index: number; company: CompanyModel }>();

  @Output() addDelivery = new EventEmitter<void>();
  @Output() removeDelivery = new EventEmitter<number>();
  @Output() focusDelivery = new EventEmitter<number>();
  @Output() selectDeliveryComp = new EventEmitter<{ index: number; company: CompanyModel }>();

  @Output() vehicleChange = new EventEmitter<Event>();
  @Output() toggleCustomDriver = new EventEmitter<void>();

  @Output() revenueInputChange = new EventEmitter<Event>();
  @Output() incurredCostsInputChange = new EventEmitter<Event>();

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  getFilteredCompanies(query: string): CompanyModel[] {
    if (!query || !query.trim()) return [];
    const q = query.toLowerCase().trim();
    return this.companies.filter(c => 
      c.name.toLowerCase().includes(q) || 
      (c.address && c.address.toLowerCase().includes(q))
    ).slice(0, 5);
  }

  onClose(): void { this.close.emit(); }
  onSave(): void { this.save.emit(); }
  onAddReceipt(): void { this.addReceipt.emit(); }
  onRemoveReceipt(index: number): void { this.removeReceipt.emit(index); }
  onFocusReceiptInput(index: number): void { this.focusReceipt.emit(index); }
  onSelectReceiptCompany(index: number, company: CompanyModel): void {
    this.selectReceiptComp.emit({ index, company });
  }

  onAddDelivery(): void { this.addDelivery.emit(); }
  onRemoveDelivery(index: number): void { this.removeDelivery.emit(index); }
  onFocusDeliveryInput(index: number): void { this.focusDelivery.emit(index); }
  onSelectDeliveryCompany(index: number, company: CompanyModel): void {
    this.selectDeliveryComp.emit({ index, company });
  }

  onVehicleChanged(event: Event): void { this.vehicleChange.emit(event); }
  onToggleCustomDriverChanged(): void { this.toggleCustomDriver.emit(); }
  onRevenueInput(event: Event): void { this.revenueInputChange.emit(event); }
  onIncurredCostsInput(event: Event): void { this.incurredCostsInputChange.emit(event); }
}
