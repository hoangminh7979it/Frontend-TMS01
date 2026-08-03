import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ConfirmDialogConfig {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private dialogState = new BehaviorSubject<{ isOpen: boolean; config?: ConfirmDialogConfig }>({
    isOpen: false
  });

  dialogState$: Observable<{ isOpen: boolean; config?: ConfirmDialogConfig }> = this.dialogState.asObservable();

  confirm(config: ConfirmDialogConfig): void {
    this.dialogState.next({
      isOpen: true,
      config: {
        title: config.title || 'Xác Nhận Thao Tác',
        confirmText: config.confirmText || 'Đồng Ý Xóa',
        cancelText: config.cancelText || 'Hủy Quả',
        type: config.type || 'danger',
        ...config
      }
    });
  }

  close(): void {
    const current = this.dialogState.value;
    if (current.config?.onCancel) {
      current.config.onCancel();
    }
    this.dialogState.next({ isOpen: false });
  }

  handleConfirm(): void {
    const current = this.dialogState.value;
    if (current.config?.onConfirm) {
      current.config.onConfirm();
    }
    this.dialogState.next({ isOpen: false });
  }
}
