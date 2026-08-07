import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pagination-wrapper" *ngIf="totalItems > 0">
      <div class="pagination-info">
        <span>Hiển thị {{ startItem }} - {{ endItem }} trong tổng số <strong>{{ totalItems }}</strong> bản ghi</span>
        <div class="page-size-selector">
          <label>Kích thước trang:</label>
          <select [(ngModel)]="pageSize" (change)="onPageSizeChange()">
            <option *ngFor="let size of pageSizeOptions" [value]="size">{{ size }} bản ghi / trang</option>
          </select>
        </div>
      </div>

      <div class="pagination-controls" *ngIf="totalPages > 1">
        <button 
          class="pg-btn" 
          [disabled]="currentPage === 1" 
          (click)="goToPage(1)" 
          title="Trang đầu"
        >
          <i class="fa-solid fa-angles-left"></i>
        </button>
        <button 
          class="pg-btn" 
          [disabled]="currentPage === 1" 
          (click)="goToPage(currentPage - 1)" 
          title="Trang trước"
        >
          <i class="fa-solid fa-angle-left"></i>
        </button>

        <ng-container *ngFor="let page of visiblePages">
          <button 
            *ngIf="page !== -1" 
            class="pg-btn pg-num" 
            [class.active]="page === currentPage"
            (click)="goToPage(page)"
          >
            {{ page }}
          </button>
          <span *ngIf="page === -1" class="pg-dots">...</span>
        </ng-container>

        <button 
          class="pg-btn" 
          [disabled]="currentPage === totalPages" 
          (click)="goToPage(currentPage + 1)" 
          title="Trang sau"
        >
          <i class="fa-solid fa-angle-right"></i>
        </button>
        <button 
          class="pg-btn" 
          [disabled]="currentPage === totalPages" 
          (click)="goToPage(totalPages)" 
          title="Trang cuối"
        >
          <i class="fa-solid fa-angles-right"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .pagination-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      background: var(--bg-card);
      border-top: 1px solid var(--border-subtle);
      border-radius: 0 0 10px 10px;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .pagination-info {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .pagination-info strong {
      color: var(--cyan-accent);
      font-weight: 700;
    }

    .page-size-selector {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .page-size-selector select {
      background: var(--bg-input);
      color: var(--text-title);
      border: 1px solid var(--border-subtle);
      border-radius: 4px;
      padding: 3px 8px;
      font-size: 0.82rem;
      cursor: pointer;
      outline: none;
    }

    .page-size-selector select:focus {
      border-color: var(--cyan-accent);
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .pg-btn {
      min-width: 32px;
      height: 32px;
      padding: 0 8px;
      border: 1px solid var(--border-subtle);
      background: var(--bg-input);
      color: var(--text-main);
      border-radius: 4px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    .pg-btn:hover:not([disabled]) {
      background: rgba(56, 189, 248, 0.15);
      border-color: var(--cyan-accent);
      color: var(--cyan-accent);
    }

    .pg-btn.active {
      background: var(--cyan-accent);
      color: #0f172a;
      border-color: var(--cyan-accent);
      font-weight: 800;
    }

    .pg-btn[disabled] {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .pg-dots {
      padding: 0 4px;
      color: var(--text-dim);
    }
  `]
})
export class PaginationComponent implements OnChanges {
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 1;
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50, 100];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  totalPages: number = 1;
  startItem: number = 0;
  endItem: number = 0;
  visiblePages: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    this.startItem = this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
    this.endItem = Math.min(this.currentPage * this.pageSize, this.totalItems);

    this.generateVisiblePages();
  }

  generateVisiblePages(): void {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, this.currentPage - 1);
      let end = Math.min(this.totalPages, this.currentPage + 1);

      if (this.currentPage <= 2) {
        end = 4;
      } else if (this.currentPage >= this.totalPages - 1) {
        start = this.totalPages - 3;
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push(-1); // -1 represent dots
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < this.totalPages) {
        if (end < this.totalPages - 1) pages.push(-1);
        pages.push(this.totalPages);
      }
    }

    this.visiblePages = pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.calculatePagination();
      this.pageChange.emit(this.currentPage);
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.calculatePagination();
    this.pageSizeChange.emit(this.pageSize);
  }
}
