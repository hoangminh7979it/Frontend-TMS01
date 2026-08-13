import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ExpenseTypeModel } from '@core/models/expense.model';
import { VehicleModel } from '@core/models/vehicle.model';
import { EmployeeModel } from '@core/models/employee.model';

export interface DetailRow {
  expenseTypeId: number | null;
  formattedCost: string;
  date: string;
  description: string;
}

import {
  CurrencyFormatDirective,
  NoVietnameseDirective
} from '@shared-ui';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CurrencyFormatDirective,
    NoVietnameseDirective
  ],
  templateUrl: './expense-form.component.html',
  styleUrls: ['../expense-list/expense-list.component.css']
})
export class ExpenseFormComponent {
  @Input() showModal: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() expenseForm!: FormGroup;
  @Input() expenseTypes: ExpenseTypeModel[] = [];
  @Input() vehicles: VehicleModel[] = [];
  @Input() drivers: EmployeeModel[] = [];
  @Input() detailRows: DetailRow[] = [];
  @Input() formattedTotalExpense: string = '0';
  @Input() errorMessage: string | null = null;
  @Input() loading: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() addDetail = new EventEmitter<void>();
  @Output() removeDetail = new EventEmitter<number>();
  @Output() vehicleOrDriverChange = new EventEmitter<Event>();
  @Output() detailAmountInputChange = new EventEmitter<{ index: number; event: Event }>();
  @Output() totalExpenseInputChange = new EventEmitter<Event>();

  trackByIndex(index: number): number {
    return index;
  }

  onClose(): void { this.close.emit(); }
  onSave(): void { this.save.emit(); }
  onAddDetail(): void { this.addDetail.emit(); }
  onRemoveDetail(index: number): void { this.removeDetail.emit(index); }
  onVehicleOrDriverChanged(event: Event): void { this.vehicleOrDriverChange.emit(event); }
  onDetailAmountInput(index: number, event: Event): void {
    this.detailAmountInputChange.emit({ index, event });
  }
  onTotalExpenseInput(event: Event): void {
    this.totalExpenseInputChange.emit(event);
  }
}
