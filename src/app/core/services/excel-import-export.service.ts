import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

export type ExcelTemplateType = 'shipments' | 'customers' | 'companies' | 'vehicles' | 'employees' | 'expenses' | 'payroll';

export interface TemplateColumnDef {
  header: string;
  field: string;
  required: boolean;
  sampleValue: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExcelImportExportService {

  private templateConfigs: Record<ExcelTemplateType, { fileName: string; sheetName: string; columns: TemplateColumnDef[] }> = {
    shipments: {
      fileName: 'Mau_Nhap_Chuyen_Hang_TMS01.xlsx',
      sheetName: 'Chuyến Hàng',
      columns: [
        { header: 'Mã Đơn Hàng (*)', field: 'shipmentCode', required: true, sampleValue: 'DH2026-001' },
        { header: 'Mã/Tên Khách Hàng', field: 'customerName', required: false, sampleValue: 'Công ty Samsung' },
        { header: 'Loại Hàng Hóa (*)', field: 'cargoType', required: true, sampleValue: 'Linh kiện điện tử (10 Pallet)' },
        { header: 'Nơi Nhận Hàng (*)', field: 'receiptPlace', required: true, sampleValue: 'Kho Yên Phong, Bắc Ninh' },
        { header: 'Nơi Giao Hàng (*)', field: 'deliveryPlace', required: true, sampleValue: 'Cảng Hải Phòng, Hải Phòng' },
        { header: 'Trọng Lượng (kg)', field: 'weight', required: false, sampleValue: '15000' },
        { header: 'Ngày Nhận (YYYY-MM-DD)', field: 'dateOfReceipt', required: false, sampleValue: '2026-08-15' },
        { header: 'Ngày Giao (YYYY-MM-DD)', field: 'deliveryDate', required: false, sampleValue: '2026-08-16' },
        { header: 'Cước Phí VNĐ (*)', field: 'revenue', required: true, sampleValue: '25000000' },
        { header: 'Chi Phí Phát Sinh VNĐ', field: 'incurredCosts', required: false, sampleValue: '500000' },
        { header: 'Biển Số Xe', field: 'licensePlate', required: false, sampleValue: '51C-123.45' },
        { header: 'Mã Tài Xế', field: 'driverCode', required: false, sampleValue: 'TX-001' },
        { header: 'Ghi Chú', field: 'notes', required: false, sampleValue: 'Hàng dễ vỡ' }
      ]
    },
    customers: {
      fileName: 'Mau_Nhap_Khach_Hang_TMS01.xlsx',
      sheetName: 'Khách Hàng',
      columns: [
        { header: 'Mã Khách Hàng (*)', field: 'customerCode', required: true, sampleValue: 'KH-001' },
        { header: 'Tên Khách Hàng / Công Ty (*)', field: 'firstname', required: true, sampleValue: 'Tập Đoàn Hòa Phát' },
        { header: 'Tên Viết Tắt / Họ', field: 'lastname', required: false, sampleValue: 'Hoa Phat' },
        { header: 'Mã Số Thuế', field: 'taxCode', required: false, sampleValue: '0101234567' },
        { header: 'Số Điện Thoại', field: 'phone', required: false, sampleValue: '0912345678' },
        { header: 'Email', field: 'email', required: false, sampleValue: 'contact@hoaphat.com.vn' },
        { header: 'Địa Chỉ', field: 'address', required: false, sampleValue: 'KCN Phố Nối A, Hưng Yên' },
        { header: 'Loại Khách (CORPORATE/INDIVIDUAL)', field: 'customerType', required: false, sampleValue: 'CORPORATE' },
        { header: 'Ghi Chú', field: 'notes', required: false, sampleValue: 'Khách hàng VIP' }
      ]
    },
    companies: {
      fileName: 'Mau_Nhap_Cong_Ty_Doi_Tac_TMS01.xlsx',
      sheetName: 'Công Ty Đối Tác',
      columns: [
        { header: 'Mã Công Ty (*)', field: 'companyCode', required: true, sampleValue: 'CT-001' },
        { header: 'Tên Công Ty Đối Tác (*)', field: 'name', required: true, sampleValue: 'Công Ty TNHH Logistics Viettel' },
        { header: 'Mã Số Thuế', field: 'taxCode', required: false, sampleValue: '0100109106' },
        { header: 'Người Liên Hệ', field: 'contactPerson', required: false, sampleValue: 'Nguyễn Văn B' },
        { header: 'Số Điện Thoại', field: 'phone', required: false, sampleValue: '0988112233' },
        { header: 'Email', field: 'email', required: false, sampleValue: 'info@viettelpost.vn' },
        { header: 'Địa Chỉ Hóa Đơn', field: 'address', required: false, sampleValue: 'Tòa nhà Viettel, Cầu Giấy, Hà Nội' },
        { header: 'Mã/Tên Khách Hàng Liên Kết', field: 'customerCode', required: false, sampleValue: 'KH-001' }
      ]
    },
    vehicles: {
      fileName: 'Mau_Nhap_Doi_Xe_TMS01.xlsx',
      sheetName: 'Đội Xe',
      columns: [
        { header: 'Biển Số Xe (*)', field: 'licensePlate', required: true, sampleValue: '51C-987.65' },
        { header: 'Mã Xe', field: 'vehicleCode', required: false, sampleValue: 'XE-001' },
        { header: 'Tên Xe / Mô Tả', field: 'name', required: false, sampleValue: 'Xe Đầu Kéo Hyundai HD1000' },
        { header: 'Mã Loại Xe (TRUCK/TRAILER...)', field: 'vehicleTypeCode', required: false, sampleValue: 'CONTAINER' },
        { header: 'Tải Trọng (Tấn)', field: 'payloadCapacity', required: false, sampleValue: '30' },
        { header: 'Hạn Đăng Kiểm (YYYY-MM-DD)', field: 'inspectionExpiryDate', required: false, sampleValue: '2027-01-20' },
        { header: 'Trạng Thái (AVAILABLE/IN_TRANSIT/MAINTENANCE)', field: 'status', required: false, sampleValue: 'AVAILABLE' },
        { header: 'Ghi Chú', field: 'notes', required: false, sampleValue: 'Bảo dưỡng định kỳ' }
      ]
    },
    employees: {
      fileName: 'Mau_Nhap_Nhan_Su_TMS01.xlsx',
      sheetName: 'Nhân Sự',
      columns: [
        { header: 'Mã Nhân Viên (*)', field: 'employeeCode', required: true, sampleValue: 'NV-001' },
        { header: 'Tên / Tên Gọi (*)', field: 'firstname', required: true, sampleValue: 'Văn A' },
        { header: 'Họ Và Tên Đệm', field: 'lastname', required: false, sampleValue: 'Nguyễn' },
        { header: 'Số CCCD / CMND', field: 'nationalId', required: false, sampleValue: '001090123456' },
        { header: 'Số Điện Thoại', field: 'phone', required: false, sampleValue: '0988776655' },
        { header: 'Email', field: 'email', required: false, sampleValue: 'nguyenvana@tms.com' },
        { header: 'Địa Chỉ', field: 'address', required: false, sampleValue: 'Hà Nội' },
        { header: 'Loại Nhân Sự (DRIVER/CO_DRIVER/STAFF)', field: 'employeeTypeCode', required: false, sampleValue: 'DRIVER' },
        { header: 'Ghi Chú', field: 'notes', required: false, sampleValue: 'Lái xe đường dài' }
      ]
    },
    expenses: {
      fileName: 'Mau_Nhap_Chi_Phi_TMS01.xlsx',
      sheetName: 'Chi Phí',
      columns: [
        { header: 'Mã Phiếu Chi (*)', field: 'expenseCode', required: true, sampleValue: 'PC-2026-001' },
        { header: 'Tiêu Đề / Nội Dung Chi (*)', field: 'title', required: true, sampleValue: 'Chi phí xăng dầu xe 51C-123.45' },
        { header: 'Ngày Chi (YYYY-MM-DD)', field: 'expenseDate', required: false, sampleValue: '2026-08-10' },
        { header: 'Số Tiền VNĐ (*)', field: 'totalExpense', required: true, sampleValue: '4500000' },
        { header: 'Biển Số Xe', field: 'vehicleLicensePlate', required: false, sampleValue: '51C-123.45' },
        { header: 'Ghi Chú', field: 'notes', required: false, sampleValue: 'Có hóa đơn đỏ VAT' }
      ]
    },
    payroll: {
      fileName: 'Mau_Nhap_Bang_Luong_TMS01.xlsx',
      sheetName: 'Bảng Lương',
      columns: [
        { header: 'Mã Bảng Lương (*)', field: 'salaryCode', required: true, sampleValue: 'LUONG-08-2026' },
        { header: 'Mã Nhân Viên (*)', field: 'employeeCode', required: true, sampleValue: 'NV-001' },
        { header: 'Từ Ngày (YYYY-MM-DD)', field: 'startDate', required: false, sampleValue: '2026-08-01' },
        { header: 'Đến Ngày (YYYY-MM-DD)', field: 'endDate', required: false, sampleValue: '2026-08-31' },
        { header: 'Số Ngày Công', field: 'workDaysCount', required: false, sampleValue: '26' },
        { header: 'Lương Cơ Bản/Ngày VNĐ', field: 'salaryBasicPerDay', required: false, sampleValue: '350000' },
        { header: 'Thưởng Chuyến VNĐ', field: 'totalSalaryPerShipment', required: false, sampleValue: '2000000' },
        { header: 'Phụ Cấp VNĐ', field: 'allowanceCosts', required: false, sampleValue: '1000000' },
        { header: 'Trừ Lương VNĐ', field: 'deductionCosts', required: false, sampleValue: '200000' },
        { header: 'Ghi Chú', field: 'notes', required: false, sampleValue: 'Hoàn thành tốt công việc' }
      ]
    }
  };

  /**
   * Tải về File Excel Mẫu rỗng với tiêu đề và 1 dòng mẫu minh họa
   */
  downloadTemplate(type: ExcelTemplateType): void {
    const config = this.templateConfigs[type];
    if (!config) return;

    // 1. Tạo Dòng Tiêu Đề
    const headerRow: Record<string, string> = {};
    const sampleRow: Record<string, string> = {};

    config.columns.forEach(col => {
      headerRow[col.header] = col.header;
      sampleRow[col.header] = col.sampleValue;
    });

    // 2. Tạo WorkSheet & WorkBook
    const wsData = [headerRow, sampleRow];
    const ws = XLSX.utils.json_to_sheet(wsData, { skipHeader: true });

    // Cài đặt độ rộng cột tự động
    const colWidths = config.columns.map(col => ({
      wch: Math.max(col.header.length, col.sampleValue.length, 18)
    }));
    ws['!cols'] = colWidths;

    // 3. Tạo Sheet Hướng Dẫn
    const guideData = [
      { 'HƯỚNG DẪN NHẬP DỮ LIỆU FILE EXCEL TMS-01': 'Các cột có dấu (*) là thông tin BẮT BUỘC nhập.' },
      { 'HƯỚNG DẪN NHẬP DỮ LIỆU FILE EXCEL TMS-01': 'Định dạng ngày tháng chuẩn: YYYY-MM-DD (Ví dụ: 2026-08-15).' },
      { 'HƯỚNG DẪN NHẬP DỮ LIỆU FILE EXCEL TMS-01': 'Số tiền và trọng lượng nhập số tự nhiên, không ghi chữ VNĐ hoặc dấu phẩy.' },
      { 'HƯỚNG DẪN NHẬP DỮ LIỆU FILE EXCEL TMS-01': 'Vui lòng không thay đổi tên tiêu đề cột để hệ thống đọc chính xác.' }
    ];
    const guideWs = XLSX.utils.json_to_sheet(guideData);
    guideWs['!cols'] = [{ wch: 80 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, config.sheetName);
    XLSX.utils.book_append_sheet(wb, guideWs, 'Hướng Dẫn');

    // 4. Xuất file .xlsx
    XLSX.writeFile(wb, config.fileName);
  }

  /**
   * Đọc file Excel do người dùng Upload và parse thành mảng JSON DTO
   */
  async parseExcelFile<T = any>(file: File, type: ExcelTemplateType): Promise<{ data: T[]; errors: string[] }> {
    const config = this.templateConfigs[type];
    const errors: string[] = [];
    const parsedData: T[] = [];

    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Parse sheet thành JSON dạng array of objects
          const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

          if (!rawRows || rawRows.length === 0) {
            errors.push('File Excel rỗng, không chứa dữ liệu nhập!');
            return resolve({ data: [], errors });
          }

          // Map từ Tiêu đề cột Tiếng Việt sang field DTO
          rawRows.forEach((row, index) => {
            const rowNum = index + 2; // Dòng 1 là Header
            const item: any = {};
            let isRowEmpty = true;

            config.columns.forEach(col => {
              // Tìm giá trị trong row khớp với header
              const val = row[col.header] !== undefined ? String(row[col.header]).trim() : '';

              if (val) isRowEmpty = false;

              // Kiểm tra cột bắt buộc
              if (col.required && !val) {
                errors.push(`Dòng ${rowNum}: Bắt buộc nhập cột "${col.header}"`);
              }

              item[col.field] = val;
            });

            // Bỏ qua dòng rỗng hoàn toàn
            if (!isRowEmpty) {
              parsedData.push(item as T);
            }
          });

          resolve({ data: parsedData, errors });
        } catch (err) {
          errors.push('File Excel không đúng định dạng hoặc bị lỗi cấu trúc.');
          resolve({ data: [], errors });
        }
      };

      reader.onerror = () => {
        errors.push('Không thể đọc file Excel.');
        resolve({ data: [], errors });
      };

      reader.readAsArrayBuffer(file);
    });
  }

  getTemplateColumns(type: ExcelTemplateType): TemplateColumnDef[] {
    return this.templateConfigs[type]?.columns || [];
  }
}
