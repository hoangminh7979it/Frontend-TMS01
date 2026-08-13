import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '@core/services/toast.service';
import { Observable } from 'rxjs';

/**
 * GlobalToastContainerComponent
 *
 * Container nổi cố định ở góc trên bên phải màn hình (Top-Right Floating Toast Container).
 * Hiển thị tất cả các Toast messages được gọi từ ToastService hoặc tự động trượt ra khi có lỗi Backend.
 */
@Component({
  selector: 'app-global-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-toast-container.component.html',
  styleUrls: ['./global-toast-container.component.css']
})
export class GlobalToastContainerComponent {
  toasts$: Observable<ToastMessage[]>;

  constructor(private toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }

  removeToast(id: string): void {
    this.toastService.remove(id);
  }

  trackById(index: number, item: ToastMessage): string {
    return item.id;
  }
}
