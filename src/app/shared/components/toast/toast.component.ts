import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  icon: string;
  cssClass: string;
}

const TOAST_CONFIG: Record<ToastType, ToastConfig> = {
  success: { icon: 'fa-circle-check',         cssClass: 'tms-toast-success' },
  error:   { icon: 'fa-triangle-exclamation', cssClass: 'tms-toast-error'   },
  warning: { icon: 'fa-triangle-exclamation', cssClass: 'tms-toast-warning' },
  info:    { icon: 'fa-circle-info',           cssClass: 'tms-toast-info'    },
};

/**
 * TmsToastComponent
 *
 * Hiển thị thông báo inline (alert) với icon, màu sắc và tùy chọn tự động ẩn.
 *
 * @example
 * <tms-toast [message]="successMessage" type="success" />
 * <tms-toast [message]="errorMessage" type="error" [autoDismiss]="true" />
 * <tms-toast [message]="msg" type="warning" [dismissible]="true" (dismissed)="msg = null" />
 */
@Component({
  selector: 'tms-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
})
export class TmsToastComponent implements OnChanges, OnDestroy {
  /** Nội dung thông báo — null / undefined / '' = ẩn toast */
  @Input() message: string | null | undefined = null;

  /** Loại thông báo */
  @Input() type: ToastType = 'info';

  /** Tự động ẩn sau dismissMs milliseconds khi message thay đổi */
  @Input() autoDismiss: boolean = false;

  /** Thời gian tự động ẩn (ms) */
  @Input() dismissMs: number = 4000;

  /** Hiển thị nút đóng thủ công */
  @Input() dismissible: boolean = false;

  /** Emit khi toast bị dismiss (manual hoặc auto) */
  @Output() dismissed = new EventEmitter<void>();

  visible: boolean = true;
  private timer: ReturnType<typeof setTimeout> | null = null;

  get config(): ToastConfig {
    return TOAST_CONFIG[this.type] ?? TOAST_CONFIG['info'];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['message'] && this.message) {
      this.visible = true;
      this.clearTimer();

      if (this.autoDismiss) {
        this.timer = setTimeout(() => this.dismiss(), this.dismissMs);
      }
    }
  }

  dismiss(): void {
    this.visible = false;
    this.dismissed.emit();
    this.clearTimer();
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }
}
