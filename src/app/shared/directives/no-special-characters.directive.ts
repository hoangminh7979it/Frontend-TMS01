import { Directive, HostListener, Input, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * NoSpecialCharactersDirective
 *
 * Ngăn chặn nhập ký tự đặc biệt (chỉ cho phép Chữ cái, Chữ số và Khoảng trắng).
 * Có thể cấu hình cho phép các dấu phân cách cơ bản như dấu gạch ngang (-), gạch dưới (_) hoặc dấu chấm (.).
 *
 * @example
 * <input type="text" appNoSpecialChars /> (Chỉ chữ cái, số và khoảng trắng)
 * <input type="text" appNoSpecialChars [allowDash]="true" [allowDot]="true" /> (Cho phép thêm -, .)
 */
@Directive({
  selector: '[appNoSpecialChars]',
  standalone: true
})
export class NoSpecialCharactersDirective {
  /** Cho phép dấu gạch ngang '-' và gạch dưới '_' */
  @Input() allowDash: boolean = false;

  /** Cho phép dấu chấm '.' và dấu phẩy ',' */
  @Input() allowDot: boolean = false;

  constructor(private el: ElementRef, private ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: InputEvent): void {
    const input = this.el.nativeElement as HTMLInputElement;
    const initialValue = input.value;

    if (!initialValue) return;

    // Xây dựng regex lọc ký tự đặc biệt
    // Mặc định: Giữ lại Chữ cái tiếng Việt, Chữ số, Khoảng trắng
    let allowedPattern = 'a-zA-Z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐÀ-Ỹ\\s';

    if (this.allowDash) {
      allowedPattern += '\\-_';
    }
    if (this.allowDot) {
      allowedPattern += '\\.,';
    }

    const regex = new RegExp(`[^${allowedPattern}]`, 'g');
    const newValue = initialValue.replace(regex, '');

    if (initialValue !== newValue) {
      input.value = newValue;
      if (this.ngControl && this.ngControl.control) {
        this.ngControl.control.setValue(newValue, { emitEvent: false });
      }
      event.stopPropagation();
    }
  }
}
