import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { EmployeeTypeModel } from '@core/models/employee.model';
import { UserModel } from '@core/models/user.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './employee-form.component.html',
  styleUrls: ['../employee-list/employee-list.component.css']
})
export class EmployeeFormComponent {
  @Input() showModal: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() employeeForm!: FormGroup;
  @Input() employeeTypes: EmployeeTypeModel[] = [];
  @Input() users: UserModel[] = [];
  @Input() loading: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  onClose(): void { this.close.emit(); }
  onSave(): void { this.save.emit(); }
}
