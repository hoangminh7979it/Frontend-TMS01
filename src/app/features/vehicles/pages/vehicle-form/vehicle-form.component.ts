import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { VehicleTypeModel } from '@core/models/vehicle.model';
import { EmployeeModel } from '@core/models/employee.model';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['../vehicle-list/vehicle-list.component.css']
})
export class VehicleFormComponent {
  @Input() showModal: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() vehicleForm!: FormGroup;
  @Input() vehicleTypes: VehicleTypeModel[] = [];
  @Input() drivers: EmployeeModel[] = [];
  @Input() loading: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  onClose(): void { this.close.emit(); }
  onSave(): void { this.save.emit(); }
}
