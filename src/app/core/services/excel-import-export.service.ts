import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

export type ExcelTemplateType = 'shipments' | 'customers' | 'companies' | 'vehicles' | 'employees' | 'expenses' | 'payroll';

export interface TemplateColumnDef {
  header: string;
  field: string;
  required: boolean;
  sampleValue: string;
  isDate?: boolean;
}

/** Chuyển Date object hoặc chuỗi ISO thành DD/MM/YYYY */
export function formatDateDDMMYYYY(value: string | Date | null | undefined): string {
  if (!value) return '';
  const dateStr = typeof value === 'string' ? value : value.toISOString();
  // Lấy phần YYYY-MM-DD từ ISO string
  const iso = dateStr.substring(0, 10);
  const parts = iso.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/** Chuyển bất kỳ chuỗi định dạng ngày nào thành ISO YYYY-MM-DD (để gửi API) một cách thông minh và linh hoạt */
export function parseDateToISO(value: string | null | undefined): string {
  if (!value) return '';
  const trimmed = value.trim();

  // 1. Chuẩn hóa ISO dạng YYYY-MM-DD hoặc YYYY/MM/DD
  const isoMatch = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (isoMatch) {
    const yyyy = isoMatch[1];
    const mm = isoMatch[2].padStart(2, '0');
    const dd = isoMatch[3].padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // 2. Định dạng có dạng: [Phần 1] / [Phần 2] / [Phần 3]
  const dateParts = trimmed.split(/[\/\-\s\.]+/);
  if (dateParts.length >= 3) {
    const p1 = dateParts[0].padStart(2, '0');
    const p2 = dateParts[1].padStart(2, '0');
    const p3 = dateParts[2];

    // Trường hợp: DD/MM/YYYY hoặc MM/DD/YYYY (với p3 là Năm 4 chữ số, ví dụ 2026)
    if (p3.length === 4) {
      const num1 = Number(p1);
      const num2 = Number(p2);
      const year = Number(p3);

      // Nếu p1 > 12 -> chắc chắn p1 là Ngày (DD), p2 là Tháng (MM) -> DD/MM/YYYY
      if (num1 > 12 && num1 <= 31 && num2 >= 1 && num2 <= 12) {
        return `${year}-${String(num2).padStart(2, '0')}-${String(num1).padStart(2, '0')}`;
      }

      // Nếu p2 > 12 -> chắc chắn p2 là Ngày (DD), p1 là Tháng (MM) -> MM/DD/YYYY (kiểu US trong Excel)
      if (num2 > 12 && num2 <= 31 && num1 >= 1 && num1 <= 12) {
        return `${year}-${String(num1).padStart(2, '0')}-${String(num2).padStart(2, '0')}`;
      }

      // Nếu cả num1 và num2 đều <= 12 (ví dụ 09/07/2026 hay 07/09/2026)
      // Mặc định ưu tiên theo chuẩn Việt Nam DD/MM/YYYY: p1 là Ngày, p2 là Tháng
      if (num1 >= 1 && num1 <= 31 && num2 >= 1 && num2 <= 12) {
        return `${year}-${String(num2).padStart(2, '0')}-${String(num1).padStart(2, '0')}`;
      }
    }

    // Trường hợp năm 2 chữ số (ví dụ: 09/07/26)
    if (p3.length === 2) {
      const year = 2000 + Number(p3);
      const num1 = Number(p1);
      const num2 = Number(p2);
      if (num1 >= 1 && num1 <= 31 && num2 >= 1 && num2 <= 12) {
        return `${year}-${String(num2).padStart(2, '0')}-${String(num1).padStart(2, '0')}`;
      }
    }
  }

  // 3. Fallback: dùng Date.parse của JS nếu không khớp các quy tắc trên
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  return trimmed;
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
        { header: 'Loại Hàng Hóa', field: 'cargoType', required: false, sampleValue: 'Linh kiện điện tử (10 Pallet)' },
        { header: 'Nơi Nhận Hàng (*)', field: 'receiptPlace', required: true, sampleValue: 'Kho Yên Phong, Bắc Ninh + Kho Hải Dương' },
        { header: 'Nơi Giao Hàng (*)', field: 'deliveryPlace', required: true, sampleValue: 'Cảng Hải Phòng + Kho ICD Phú Mỹ' },
        { header: 'Trọng Lượng (kg)', field: 'weight', required: false, sampleValue: '15000' },
        { header: 'Ngày Nhận (DD/MM/YYYY)', field: 'dateOfReceipt', required: false, sampleValue: '15/08/2026', isDate: true },
        { header: 'Ngày Giao (DD/MM/YYYY)', field: 'deliveryDate', required: false, sampleValue: '16/08/2026', isDate: true },
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
        { header: 'Hạn Đăng Kiểm (DD/MM/YYYY)', field: 'inspectionExpiryDate', required: false, sampleValue: '20/01/2027', isDate: true },
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
        { header: 'Ngày Chi (DD/MM/YYYY)', field: 'expenseDate', required: false, sampleValue: '10/08/2026', isDate: true },
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
        { header: 'Từ Ngày (DD/MM/YYYY)', field: 'startDate', required: false, sampleValue: '01/08/2026', isDate: true },
        { header: 'Đến Ngày (DD/MM/YYYY)', field: 'endDate', required: false, sampleValue: '31/08/2026', isDate: true },
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
      { 'HƯỚNG DẪN NHẬP DỮ LIỆU FILE EXCEL TMS-01': 'Định dạng ngày tháng chuẩn: DD/MM/YYYY (Ví dụ: 15/08/2026).' },
      { 'HƯỚNG DẪN NHẬP DỮ LIỆU FILE EXCEL TMS-01': 'Số tiền và trọng lượng nhập số tự nhiên, không ghi chữ VNĐ hoặc dấu phẩy.' },
      { 'HƯỚNG DẪN NHẬP DỮ LIỆU FILE EXCEL TMS-01': 'Nếu có NHIỀU NƠI NHẬN hoặc NHIỀU NƠI GIAO, dùng dấu + để phân cách. Ví dụ: Nam Hưng + Phú Mỹ' },
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

          // Parse sheet thành JSON với raw: false để lấy đúng định dạng chuỗi hiển thị trên Excel (formatted text)
          const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });

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
              let val = row[col.header] !== undefined ? String(row[col.header]).trim() : '';

              // Xử lý cột ngày tháng (isDate)
              if (col.isDate && row[col.header] !== undefined && row[col.header] !== null && row[col.header] !== '') {
                const cellVal = row[col.header];

                if (typeof cellVal === 'number') {
                  // Trường hợp Excel lưu dưới dạng Serial Date Number (ví dụ: 46219)
                  const jsDate = XLSX.SSF.parse_date_code(cellVal);
                  if (jsDate) {
                    const dd = String(jsDate.d).padStart(2, '0');
                    const mm = String(jsDate.m).padStart(2, '0');
                    const yyyy = jsDate.y;
                    val = `${dd}/${mm}/${yyyy}`;
                  }
                } else if (cellVal instanceof Date) {
                  // Trường hợp XLSX đọc cell ra đối tượng Date của JS
                  const dd = String(cellVal.getDate()).padStart(2, '0');
                  const mm = String(cellVal.getMonth() + 1).padStart(2, '0');
                  const yyyy = cellVal.getFullYear();
                  val = `${dd}/${mm}/${yyyy}`;
                } else {
                  // Chuỗi văn bản từ Excel (ví dụ: "09/07/2026", "2026-07-09", "9/7/2026")
                  val = String(cellVal).trim();
                }
              }

              if (val) isRowEmpty = false;

              // Kiểm tra cột bắt buộc
              if (col.required && !val) {
                errors.push(`Dòng ${rowNum}: Bắt buộc nhập cột "${col.header}"`);
              }

              // Convert ngày (bất kỳ định dạng DD/MM/YYYY hay YYYY-MM-DD...) -> YYYY-MM-DD chuẩn ISO gửi API
              if (col.isDate && val) {
                val = parseDateToISO(val);
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
