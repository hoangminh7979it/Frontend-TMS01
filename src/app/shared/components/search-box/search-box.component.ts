import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * TmsSearchBoxComponent
 *
 * Ô tìm kiếm với icon kính lúp, hỗ trợ two-way binding [(value)], ngModel
 * và tích hợp các bộ lọc ngăn tiếng Việt có dấu, lọc số, tự động in hoa...
 *
 * @example
 * <tms-search-box
 *   [(value)]="searchQuery"
 *   [noVietnamese]="true"
 *   [uppercase]="true"
 *   placeholder="Tìm theo Mã đơn, Khách hàng..."
 *   (valueChange)="onSearch()"
 * />
 */
@Component({
  selector: 'tms-search-box',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TmsSearchBoxComponent),
      multi: true,
    },
  ],
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.css'],
})
export class TmsSearchBoxComponent implements ControlValueAccessor {
  /** Giá trị hiện tại (hỗ trợ two-way binding [(value)]) */
  @Input() value: string = '';

  /** Placeholder text */
  @Input() placeholder: string = 'Tìm kiếm...';

  /** Hiện nút X để xóa input */
  @Input() clearable: boolean = true;

  /** Disable input */
  @Input() disabled: boolean = false;

  /** Quy tắc 1: Ngăn gõ tiếng Việt có dấu */
  @Input() noVietnamese: boolean = false;

  /** Quy tắc 2: Chỉ cho phép nhập số */
  @Input() numbersOnly: boolean = false;

  /** Quy tắc 3: Tự động IN HOA */
  @Input() uppercase: boolean = false;

  /** Quy tắc 4: Ngăn gõ 2 khoảng trắng liên tiếp (mặc định: true) */
  @Input() noConsecutiveSpaces: boolean = true;

  /** Quy tắc 5: Ngăn gõ ký tự đặc biệt */
  @Input() noSpecialChars: boolean = false;

  /** Emit khi giá trị thay đổi (dùng với [(value)]) */
  @Output() valueChange = new EventEmitter<string>();

  isFocused: boolean = false;

  // ControlValueAccessor
  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  onInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    let newValue = inputEl.value;

    // Lọc 2 khoảng trắng liên tiếp nếu noConsecutiveSpaces = true
    if (this.noConsecutiveSpaces && newValue) {
      newValue = newValue.replace(/ {2,}/g, ' ').replace(/^\s+/, '');
    }

    // Lọc tiếng Việt có dấu nếu noVietnamese = true
    if (this.noVietnamese && newValue) {
      newValue = this.removeVietnameseTones(newValue);
    }

    // Lọc chỉ giữ chữ số nếu numbersOnly = true
    if (this.numbersOnly && newValue) {
      newValue = newValue.replace(/[^0-9]/g, '');
    }

    // Lọc ký tự đặc biệt nếu noSpecialChars = true
    if (this.noSpecialChars && newValue) {
      newValue = newValue.replace(/[^a-zA-Z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐÀ-Ỹ\s\-_]/g, '');
    }

    // Tự động IN HOA nếu uppercase = true
    if (this.uppercase && newValue) {
      newValue = newValue.toUpperCase();
    }

    if (inputEl.value !== newValue) {
      inputEl.value = newValue;
    }

    this.value = newValue;
    this.valueChange.emit(newValue);
    this.onChange(newValue);
  }

  clearValue(): void {
    this.value = '';
    this.valueChange.emit('');
    this.onChange('');
  }

  private removeVietnameseTones(str: string): string {
    return str
      .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
      .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
      .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
      .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
      .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
      .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A')
      .replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E')
      .replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I')
      .replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O')
      .replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U')
      .replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y')
      .replace(/Đ/g, 'D')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
