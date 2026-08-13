import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * TmsLoadingStateComponent
 *
 * Component kết hợp hiển thị trạng thái "đang tải" (spinner) và trạng thái "trống" (empty state).
 * Logic ưu tiên: loading → hiển thị spinner; không loading + empty → hiển thị empty state;
 * ngược lại → hiển thị ng-content.
 *
 * @example
 * <tms-loading-state
 *   [loading]="isLoading"
 *   [empty]="filteredList.length === 0"
 *   emptyIcon="fa-boxes-packing"
 *   emptyText="Chưa có đơn hàng nào"
 * />
 *
 * @example — Wrap nội dung table
 * <tms-loading-state [loading]="isLoading" [empty]="items.length === 0">
 *   <table class="tech-table">...</table>
 * </tms-loading-state>
 */
@Component({
  selector: 'tms-loading-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-state.component.html',
  styleUrls: ['./loading-state.component.css'],
})
export class TmsLoadingStateComponent {
  /** Trạng thái đang tải — ưu tiên cao nhất, hiển thị spinner */
  @Input({ required: true }) loading!: boolean;

  /** Trạng thái trống dữ liệu — chỉ hiển thị khi loading = false */
  @Input({ required: true }) empty!: boolean;

  /** Text hiển thị bên dưới spinner */
  @Input() loadingText: string = 'Đang tải dữ liệu...';

  /** Font Awesome icon class cho empty state (ví dụ: 'fa-boxes-packing') */
  @Input() emptyIcon: string = 'fa-inbox';

  /** Text tiêu đề empty state */
  @Input() emptyText: string = 'Chưa có dữ liệu';

  /** Text gợi ý nhỏ bên dưới empty state */
  @Input() emptyHint?: string;
}
