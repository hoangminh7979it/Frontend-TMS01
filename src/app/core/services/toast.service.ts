import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  durationMs?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$: Observable<ToastMessage[]> = this.toastsSubject.asObservable();

  /**
   * Hiển thị Toast thông báo thành công (Màu xanh lá)
   */
  success(message: string, title: string = 'Thành công', durationMs: number = 4000): void {
    this.show({ type: 'success', title, message, durationMs });
  }

  /**
   * Hiển thị Toast thông báo lỗi (Màu đỏ)
   */
  error(message: string, title: string = 'Lỗi hệ thống', durationMs: number = 5000): void {
    this.show({ type: 'error', title, message, durationMs });
  }

  /**
   * Hiển thị Toast cảnh báo (Màu vàng)
   */
  warning(message: string, title: string = 'Cảnh báo', durationMs: number = 4000): void {
    this.show({ type: 'warning', title, message, durationMs });
  }

  /**
   * Hiển thị Toast thông tin (Màu xanh dương/cyan)
   */
  info(message: string, title: string = 'Thông tin', durationMs: number = 4000): void {
    this.show({ type: 'info', title, message, durationMs });
  }

  /**
   * Đưa 1 toast message vào danh sách hiển thị
   */
  show(toast: Omit<ToastMessage, 'id'>): void {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    const currentToasts = this.toastsSubject.value;

    // Giới hạn tối đa 5 toast cùng lúc
    const updatedToasts = [newToast, ...currentToasts].slice(0, 5);
    this.toastsSubject.next(updatedToasts);

    // Tự động tắt sau durationMs
    const duration = toast.durationMs ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  /**
   * Xóa 1 toast theo ID
   */
  remove(id: string): void {
    const currentToasts = this.toastsSubject.value;
    const filtered = currentToasts.filter(t => t.id !== id);
    this.toastsSubject.next(filtered);
  }

  /**
   * Xóa tất cả toast hiện có
   */
  clear(): void {
    this.toastsSubject.next([]);
  }
}
