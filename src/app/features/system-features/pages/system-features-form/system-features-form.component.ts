import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-system-features-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './system-features-form.component.html',
  styleUrls: ['../system-features-list/system-features-list.component.css']
})
export class SystemFeaturesFormComponent {
  @Input() showModal: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() featureForm!: FormGroup;
  @Input() errorMessage: string | null = null;
  @Input() loading: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  onClose(): void { this.close.emit(); }
  onSave(): void { this.save.emit(); }
}
