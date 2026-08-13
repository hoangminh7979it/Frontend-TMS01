import { Directive, HostListener, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * UppercaseDirective
 *
 * Tự động chuyển ký tự nhập từ thường sang IN HOA theo thời gian thực.
 * Thích hợp cho Biển số xe, Mã chứng từ, Mã nhân viên...
 *
 * @example
 * <input type="text" appUppercase />
 */
@Directive({
  selector: '[appUppercase]',
  standalone: true
})
export class UppercaseDirective {
  constructor(private el: ElementRef, private ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: InputEvent): void {
    const input = this.el.nativeElement as HTMLInputElement;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    const initialValue = input.value;
    if (!initialValue) return;

    const uppercaseValue = initialValue.toUpperCase();

    if (initialValue !== uppercaseValue) {
      input.value = uppercaseValue;

      // Giữ vị trí con trỏ nhập liệu
      if (start !== null && end !== null) {
        input.setSelectionRange(start, end);
      }

      if (this.ngControl && this.ngControl.control) {
        this.ngControl.control.setValue(uppercaseValue, { emitEvent: false });
      }
    }
  }
}
