import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Biến thể màu cho icon box trong Metric Card */
export type MetricCardColor = 'blue' | 'yellow' | 'purple' | 'green' | 'red' | 'cyan' | 'orange';

/**
 * TmsMetricCardComponent
 *
 * Hiển thị một ô KPI / dashboard summary (metric card) với icon, tiêu đề, giá trị, đơn vị và ghi chú.
 * Tương ứng với pattern `.metric-card` lặp lại ở tất cả các trang trong TMS-01.
 *
 * @example
 * <tms-metric-card
 *   title="TỔNG ĐƠN HÀNG"
 *   [value]="totalCount"
 *   unit="Đơn"
 *   note="Toàn bộ đơn hàng hệ thống"
 *   icon="fa-boxes-packing"
 *   colorVariant="blue"
 * />
 */
@Component({
  selector: 'tms-metric-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metric-card.component.html',
  styleUrls: ['./metric-card.component.css'],
})
export class TmsMetricCardComponent {
  /** Nhãn tiêu đề (viết hoa) */
  @Input({ required: true }) title!: string;

  /** Giá trị số hoặc chuỗi hiển thị */
  @Input({ required: true }) value!: number | string;

  /** Đơn vị hiển thị sau giá trị (ví dụ: 'Đơn', 'VNĐ', 'Xe') */
  @Input() unit?: string;

  /** Ghi chú nhỏ bên dưới giá trị */
  @Input() note?: string;

  /** CSS class icon Font Awesome (ví dụ: 'fa-boxes-packing') */
  @Input({ required: true }) icon!: string;

  /** Biến thể màu của icon box */
  @Input() colorVariant: MetricCardColor = 'blue';

  /** Định dạng số nếu là number (thêm dấu phân cách hàng nghìn) */
  @Input() formatNumber: boolean = true;

  get iconBoxClass(): string {
    return `tms-mc-${this.colorVariant}`;
  }

  get formattedValue(): string {
    if (this.formatNumber && typeof this.value === 'number') {
      return this.value.toLocaleString('vi-VN');
    }
    return String(this.value);
  }
}
