import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './role-form.component.html',
  styleUrls: ['../roles-permissions/roles-permissions.component.css']
})
export class RoleFormComponent {
  @Input() showModal: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() roleForm!: FormGroup;
  @Input() loading: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  onClose(): void { this.close.emit(); }
  onSave(): void { this.save.emit(); }
}
