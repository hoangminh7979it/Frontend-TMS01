import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Cấu hình cho một giá trị trạng thái */
export interface StatusConfig {
  label: string;
  cssClass: string;
  icon: string;
}

/** Bảng ánh xạ mặc định cho các status code trong TMS-01 */
const DEFAULT_STATUS_MAP: Record<string, StatusConfig> = {
  // Shipment statuses
  CREATED:    { label: 'Mới Tạo',          cssClass: 'tms-sb-grey',    icon: 'fa-circle-dot' },
  DISPATCHED: { label: 'Đã Điều Xe',       cssClass: 'tms-sb-blue',    icon: 'fa-truck' },
  PICKED_UP:  { label: 'Đang Vận Chuyển',  cssClass: 'tms-sb-yellow',  icon: 'fa-truck-fast' },
  DELIVERED:  { label: 'Đã Giao Hàng',     cssClass: 'tms-sb-green',   icon: 'fa-circle-check' },
  CANCELLED:  { label: 'Đã Hủy',           cssClass: 'tms-sb-red',     icon: 'fa-ban' },

  // General active/inactive
  ACTIVE:     { label: 'Hoạt Động',        cssClass: 'tms-sb-green',   icon: 'fa-circle-check' },
  INACTIVE:   { label: 'Ngừng Hoạt Động',  cssClass: 'tms-sb-red',     icon: 'fa-circle-xmark' },

  // Vehicle statuses
  AVAILABLE:  { label: 'Sẵn Sàng',         cssClass: 'tms-sb-green',   icon: 'fa-circle-check' },
  IN_USE:     { label: 'Đang Sử Dụng',     cssClass: 'tms-sb-blue',    icon: 'fa-truck-fast' },
  MAINTENANCE:{ label: 'Bảo Dưỡng',        cssClass: 'tms-sb-yellow',  icon: 'fa-wrench' },
  RETIRED:    { label: 'Ngừng Khai Thác',  cssClass: 'tms-sb-red',     icon: 'fa-circle-xmark' },

  // Payroll / finance
  PENDING:    { label: 'Chờ Xử Lý',        cssClass: 'tms-sb-yellow',  icon: 'fa-clock' },
  PAID:       { label: 'Đã Thanh Toán',    cssClass: 'tms-sb-green',   icon: 'fa-check-double' },
  PROCESSING: { label: 'Đang Xử Lý',       cssClass: 'tms-sb-blue',    icon: 'fa-spinner' },

  // Fallback
  DEFAULT:    { label: 'Không Xác Định',   cssClass: 'tms-sb-grey',    icon: 'fa-circle' },
};

/**
 * TmsStatusBadgeComponent
 *
 * Hiển thị badge trạng thái với màu sắc và icon tương ứng.
 * Tự động ánh xạ từ status code → label + màu sắc theo bảng mặc định TMS-01.
 * Có thể override label thông qua @Input() label.
 *
 * @example
 * <tms-status-badge status="DELIVERED" />
 * <tms-status-badge status="ACTIVE" label="Còn Hoạt Động" />
 */
@Component({
  selector: 'tms-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.css'],
})
export class TmsStatusBadgeComponent implements OnChanges {
  /** Status code (ví dụ: 'CREATED', 'DELIVERED', 'ACTIVE') */
  @Input({ required: true }) status!: string;

  /** Override label (nếu không truyền thì dùng label mặc định từ bảng ánh xạ) */
  @Input() label?: string;

  /** Bảng ánh xạ tùy chỉnh — merge với bảng mặc định */
  @Input() customStatusMap?: Record<string, StatusConfig>;

  resolvedConfig: StatusConfig = DEFAULT_STATUS_MAP['DEFAULT'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['status'] || changes['customStatusMap']) {
      this.resolveConfig();
    }
  }

  private resolveConfig(): void {
    const mergedMap = this.customStatusMap
      ? { ...DEFAULT_STATUS_MAP, ...this.customStatusMap }
      : DEFAULT_STATUS_MAP;

    const upperStatus = (this.status ?? '').toUpperCase();
    this.resolvedConfig = mergedMap[upperStatus] ?? mergedMap['DEFAULT'];
  }

  get resolvedLabel(): string {
    return this.label ?? this.resolvedConfig.label;
  }
}
