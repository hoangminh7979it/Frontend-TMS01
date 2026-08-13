import { Directive, HostListener, Input, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * NumbersOnlyDirective
 *
 * Chỉ cho phép nhập số (0-9). Ngăn chặn hoàn toàn phím chữ cái, ký tự đặc biệt, phím cách.
 * Hỗ trợ số thập phân nếu allowDecimal = true.
 *
 * @example
 * <input type="text" appNumbersOnly /> (Chỉ số nguyên)
 * <input type="text" appNumbersOnly [allowDecimal]="true" /> (Cho phép số thập phân có dấu chấm/phẩy)
 */
@Directive({
  selector: '[appNumbersOnly]',
  standalone: true
})
export class NumbersOnlyDirective {
  /** Cho phép dấu chấm / dấu phẩy cho số thập phân */
  @Input() allowDecimal: boolean = false;

  constructor(private el: ElementRef, private ngControl: NgControl) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Cho phép các phím chức năng điều khiển cơ bản
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'Home', 'End'
    ];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Cho phép Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) {
      return;
    }

    // Cho phép nhập dấu thập phân (chỉ 1 lần)
    if (this.allowDecimal && (event.key === '.' || event.key === ',')) {
      const currentVal: string = this.el.nativeElement.value || '';
      if (!currentVal.includes('.') && !currentVal.includes(',')) {
        return;
      }
    }

    // Nếu phím không phải là chữ số -> Chặn phím
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedInput: string = event.clipboardData?.getData('text') || '';

    let cleanValue = '';
    if (this.allowDecimal) {
      cleanValue = pastedInput.replace(/[^0-9.,]/g, '');
    } else {
      cleanValue = pastedInput.replace(/[^0-9]/g, '');
    }

    const input = this.el.nativeElement as HTMLInputElement;
    input.value = cleanValue;

    if (this.ngControl && this.ngControl.control) {
      this.ngControl.control.setValue(cleanValue);
    }
  }
}
