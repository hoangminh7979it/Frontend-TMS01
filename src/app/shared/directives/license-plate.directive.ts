import { Directive, HostListener, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * LicensePlateDirective
 *
 * Tự động chuyển IN HOA, loại bỏ dấu cách và ký tự không hợp lệ,
 * đồng thời định dạng biển số xe Việt Nam (VD: 51C12345 -> 51C-123.45).
 *
 * @example
 * <input type="text" appLicensePlate placeholder="Ví dụ: 51C-123.45" />
 */
@Directive({
  selector: '[appLicensePlate]',
  standalone: true
})
export class LicensePlateDirective {
  constructor(private el: ElementRef, private ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: InputEvent): void {
    const input = this.el.nativeElement as HTMLInputElement;
    let val = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (!val) {
      this.updateValue(input, '');
      return;
    }

    // Giới hạn 9 ký tự nguyên bản (VD: 51C12345)
    if (val.length > 9) {
      val = val.substring(0, 9);
    }

    let formatted = val;

    // Biến đổi định dạng: 2 số + 1 chữ + (1 chữ/số) + 3..5 số
    // Ví dụ: 51C-123.45 hoặc 29H-9999
    if (val.length > 3) {
      const prefix = val.substring(0, 3); // 51C
      const rest = val.substring(3);       // 12345

      if (rest.length > 3) {
        const p1 = rest.substring(0, 3);
        const p2 = rest.substring(3);
        formatted = `${prefix}-${p1}.${p2}`;
      } else {
        formatted = `${prefix}-${rest}`;
      }
    }

    this.updateValue(input, formatted);
  }

  private updateValue(input: HTMLInputElement, formatted: string): void {
    if (input.value !== formatted) {
      input.value = formatted;
      if (this.ngControl && this.ngControl.control) {
        this.ngControl.control.setValue(formatted, { emitEvent: false });
      }
    }
  }
}
