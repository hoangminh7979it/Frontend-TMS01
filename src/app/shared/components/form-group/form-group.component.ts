import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * TmsFormGroupComponent
 *
 * Wrapper cho một form field (label + input/select/textarea + error message + hint).
 * Dùng ng-content để nhận input element từ component cha.
 *
 * @example — Reactive Form
 * <tms-form-group label="Tên Khách Hàng" [required]="true" [errorMessage]="getError('customerName')">
 *   <input formControlName="customerName" placeholder="Nhập tên khách hàng..." />
 * </tms-form-group>
 *
 * @example — Select dropdown
 * <tms-form-group label="Loại Xe" [required]="true">
 *   <select formControlName="vehicleTypeId">
 *     <option *ngFor="let t of types" [value]="t.id">{{ t.name }}</option>
 *   </select>
 * </tms-form-group>
 */
@Component({
  selector: 'tms-form-group',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-group.component.html',
  styleUrls: ['./form-group.component.css'],
})
export class TmsFormGroupComponent {
  /** Nhãn hiển thị bên trên input */
  @Input() label?: string;

  /** Hiển thị dấu * bắt buộc */
  @Input() required: boolean = false;

  /** Thông báo lỗi — khi khác null/undefined sẽ đổi border thành màu đỏ */
  @Input() errorMessage?: string | null;

  /** Gợi ý nhỏ bên dưới input (ẩn khi có errorMessage) */
  @Input() hint?: string;
}
