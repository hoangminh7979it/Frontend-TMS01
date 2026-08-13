import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * TmsPageHeaderComponent
 *
 * Hiển thị tiêu đề trang với subtitle và vùng chứa action buttons bên phải.
 * Sử dụng ng-content để nhận các action buttons từ component cha.
 *
 * @example
 * <tms-page-header
 *   title="Quản Lý Vận Chuyển"
 *   subtitle="Quản lý chuyến xe, điểm đi - điểm đến..."
 * >
 *   <button class="btn btn-primary">Tạo Mới</button>
 * </tms-page-header>
 */
@Component({
  selector: 'tms-page-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.css'],
})
export class TmsPageHeaderComponent {
  /** Tiêu đề chính của trang */
  @Input({ required: true }) title!: string;

  /** Mô tả ngắn bên dưới tiêu đề (tuỳ chọn) */
  @Input() subtitle?: string;
}
