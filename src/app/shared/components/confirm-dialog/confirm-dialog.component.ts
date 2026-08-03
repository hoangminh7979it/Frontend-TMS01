import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService, ConfirmDialogConfig } from '@core/services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="confirm-backdrop" *ngIf="isOpen" (click)="onBackdropClick($event)">
      <div class="confirm-card glass-card">
        
        <div class="confirm-header" [ngClass]="config?.type || 'danger'">
          <div class="header-icon-box">
            <i class="fa-solid" [ngClass]="{
              'fa-triangle-exclamation': config?.type === 'danger' || config?.type === 'warning',
              'fa-circle-question': config?.type === 'info'
            }"></i>
          </div>
          <h3 class="header-title">{{ config?.title || 'Xác Nhận Thao Tác' }}</h3>
          <button class="close-btn" (click)="onCancel()">&times;</button>
        </div>

        <div class="confirm-body">
          <p class="confirm-message">{{ config?.message }}</p>
        </div>

        <div class="confirm-footer">
          <button type="button" class="btn btn-cancel" (click)="onCancel()">
            <i class="fa-solid fa-xmark"></i> {{ config?.cancelText || 'Hủy Bỏ' }}
          </button>
          <button type="button" class="btn btn-confirm" [ngClass]="config?.type || 'danger'" (click)="onConfirm()">
            <i class="fa-solid" [ngClass]="{
              'fa-trash-can': config?.type === 'danger',
              'fa-check': config?.type !== 'danger'
            }"></i> {{ config?.confirmText || 'Đồng Ý Thao Tác' }}
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .confirm-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(6px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: fadeIn 0.15s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .confirm-card {
      width: 100%;
      max-width: 460px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 2px;
      box-shadow: 0 25px 40px -10px rgba(0, 0, 0, 0.7);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: zoomIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes zoomIn {
      from { transform: scale(0.92); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .confirm-header {
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-panel-header);
    }

    .header-icon-box {
      width: 36px;
      height: 36px;
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }

    .confirm-header.danger .header-icon-box {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
    }

    .confirm-header.warning .header-icon-box {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
    }

    .confirm-header.info .header-icon-box {
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
    }

    .header-title {
      font-size: 1rem;
      font-weight: 800;
      color: var(--text-title);
      flex: 1;
      letter-spacing: -0.2px;
    }

    .close-btn {
      background: transparent;
      border: none;
      color: var(--text-dim);
      font-size: 1.5rem;
      cursor: pointer;
      line-height: 1;
      transition: color 0.15s ease;
    }

    .close-btn:hover {
      color: #ef4444;
    }

    .confirm-body {
      padding: 22px 20px;
    }

    .confirm-message {
      font-size: 0.92rem;
      color: var(--text-main);
      line-height: 1.5;
      font-weight: 500;
    }

    .confirm-footer {
      padding: 14px 20px;
      background: var(--bg-panel-header);
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .btn {
      padding: 9px 16px;
      border-radius: 2px;
      font-size: 0.84rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: none;
      transition: all 0.15s ease;
    }

    .btn-cancel {
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
    }

    .btn-cancel:hover {
      background: var(--bg-hover);
      color: var(--text-title);
    }

    .btn-confirm.danger {
      background: #dc2626;
      color: #ffffff;
    }

    .btn-confirm.danger:hover {
      background: #b91c1c;
    }

    .btn-confirm.warning {
      background: #d97706;
      color: #ffffff;
    }

    .btn-confirm.warning:hover {
      background: #b45309;
    }

    .btn-confirm.info {
      background: var(--primary-accent);
      color: #ffffff;
    }

    .btn-confirm.info:hover {
      background: var(--primary-accent-hover);
    }
  `]
})
export class ConfirmDialogComponent implements OnInit {
  isOpen: boolean = false;
  config?: ConfirmDialogConfig;

  constructor(private dialogService: ConfirmDialogService) {}

  ngOnInit(): void {
    this.dialogService.dialogState$.subscribe(state => {
      this.isOpen = state.isOpen;
      this.config = state.config;
    });
  }

  onConfirm(): void {
    this.dialogService.handleConfirm();
  }

  onCancel(): void {
    this.dialogService.close();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('confirm-backdrop')) {
      this.onCancel();
    }
  }
}
