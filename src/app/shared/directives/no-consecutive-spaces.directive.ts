import { Directive, HostListener, Input, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * NoConsecutiveSpacesDirective
 *
 * Ngăn chặn người dùng nhập từ 2 khoảng trắng (space) liên tiếp trở lên.
 * Tự động thu gọn các khoảng trắng lặp lại thành 1 khoảng trắng duy nhất,
 * đồng thời loại bỏ khoảng trắng ở đầu dòng nếu được cấu hình trimStart = true.
 *
 * @example
 * <input type="text" appNoConsecutiveSpaces />
 */
@Directive({
  selector: '[appNoConsecutiveSpaces]',
  standalone: true
})
export class NoConsecutiveSpacesDirective {
  /** Loại bỏ khoảng trắng ở đầu dòng (mặc định: true) */
  @Input() trimStart: boolean = true;

  constructor(private el: ElementRef, private ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: InputEvent): void {
    const input = this.el.nativeElement as HTMLInputElement;
    const initialValue = input.value;

    if (!initialValue) return;

    // Thay thế 2 hoặc nhiều khoảng trắng liên tiếp thành 1 khoảng trắng
    let newValue = initialValue.replace(/ {2,}/g, ' ');

    if (this.trimStart) {
      newValue = newValue.replace(/^\s+/, '');
    }

    if (initialValue !== newValue) {
      input.value = newValue;
      if (this.ngControl && this.ngControl.control) {
        this.ngControl.control.setValue(newValue, { emitEvent: false });
      }
      event.stopPropagation();
    }
  }
}
