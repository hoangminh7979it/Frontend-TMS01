import { Directive, HostListener, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * CurrencyFormatDirective
 *
 * Tự động phân cách hàng nghìn cho tiền tệ (VNĐ) khi nhập số.
 * Ví dụ: Người dùng gõ 1000000 -> Tự động biến thành 1,000,000.
 *
 * @example
 * <input type="text" appCurrencyFormat />
 */
@Directive({
  selector: '[appCurrencyFormat]',
  standalone: true
})
export class CurrencyFormatDirective {
  constructor(private el: ElementRef, private ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: InputEvent): void {
    const input = this.el.nativeElement as HTMLInputElement;
    const rawValue = input.value.replace(/[^0-9]/g, '');

    if (!rawValue) {
      this.updateValue(input, '');
      return;
    }

    const numberValue = parseInt(rawValue, 10);
    if (isNaN(numberValue)) {
      this.updateValue(input, '');
      return;
    }

    const formattedValue = numberValue.toLocaleString('en-US'); // dùng dấu phẩy phân cách
    this.updateValue(input, formattedValue);
  }

  private updateValue(input: HTMLInputElement, formatted: string): void {
    input.value = formatted;
    if (this.ngControl && this.ngControl.control) {
      // Lưu giá trị số thực tế (raw number string) vào Form Control để submit API dễ dàng
      const rawDigits = formatted.replace(/[^0-9]/g, '');
      this.ngControl.control.setValue(rawDigits ? parseInt(rawDigits, 10) : null, { emitEvent: false });
    }
  }
}
