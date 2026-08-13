import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExcelImportExportService, ExcelTemplateType, TemplateColumnDef } from '@core/services/excel-import-export.service';

/**
 * ExcelImportModalComponent
 *
 * Reusable Component hiển thị Modal Kéo-Thả (Drag & Drop) và Xem trước (Preview) dữ liệu từ file Excel (.xlsx)
 * trước khi bấm xác nhận lưu hàng loạt vào hệ thống.
 */
@Component({
  selector: 'app-excel-import-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './excel-import-modal.component.html',
  styleUrls: ['./excel-import-modal.component.css']
})
export class ExcelImportModalComponent {
  @Input() show: boolean = false;
  @Input() type: ExcelTemplateType = 'shipments';
  @Input() title: string = 'Nhập Dữ Liệu Từ File Excel';

  @Output() closed = new EventEmitter<void>();
  @Output() imported = new EventEmitter<any[]>();

  selectedFile: File | null = null;
  parsedData: any[] = [];
  errors: string[] = [];
  columnDefs: TemplateColumnDef[] = [];

  isDragOver: boolean = false;
  loading: boolean = false;

  constructor(private excelService: ExcelImportExportService) {}

  ngOnChanges(): void {
    if (this.show && this.type) {
      this.columnDefs = this.excelService.getTemplateColumns(this.type);
    }
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  async processFile(file: File): Promise<void> {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      this.errors = ['Chỉ hỗ trợ tải lên file Excel có định dạng .xlsx hoặc .xls'];
      this.selectedFile = null;
      this.parsedData = [];
      return;
    }

    this.selectedFile = file;
    this.loading = true;
    this.errors = [];

    const result = await this.excelService.parseExcelFile(file, this.type);
    this.loading = false;
    this.parsedData = result.data;
    this.errors = result.errors;
  }

  confirmImport(): void {
    if (this.parsedData.length > 0) {
      this.imported.emit(this.parsedData);
      this.close();
    }
  }

  close(): void {
    this.selectedFile = null;
    this.parsedData = [];
    this.errors = [];
    this.closed.emit();
  }
}
