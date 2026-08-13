import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * TmsTablePanelComponent
 *
 * Wrapper panel cho data table với header (tiêu đề + icon + đếm bản ghi) và vùng body chứa table.
 * Tương ứng với pattern `.panel-card > .panel-header + .panel-body` lặp lại ở mọi trang TMS-01.
 *
 * Có 2 slot ng-content:
 *   - slot mặc định: table / nội dung chính
 *   - [tmsHeaderActions]: action buttons ở góc phải header
 *
 * @example
 * <tms-table-panel title="Danh Sách Đơn Hàng" icon="fa-route" [count]="filteredList.length">
 *   <table class="tech-table">...</table>
 * </tms-table-panel>
 *
 * @example với header actions:
 * <tms-table-panel title="Đơn Hàng" icon="fa-route" [count]="list.length">
 *   <button tmsHeaderActions class="btn btn-primary">Thêm Mới</button>
 *   <table class="tech-table">...</table>
 * </tms-table-panel>
 */
@Component({
  selector: 'tms-table-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-panel.component.html',
  styleUrls: ['./table-panel.component.css'],
})
export class TmsTablePanelComponent {
  /** Tiêu đề panel */
  @Input({ required: true }) title!: string;

  /** Font Awesome icon class (ví dụ: 'fa-route', 'fa-users') */
  @Input() icon?: string;

  /** Số bản ghi hiển thị ở góc phải header (null/undefined = ẩn) */
  @Input() count?: number | null;
}
