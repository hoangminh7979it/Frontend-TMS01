import { Directive, HostListener, Input, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * NoVietnameseDirective
 *
 * Ngăn chặn nhập tiếng Việt có dấu theo thời gian thực.
 * Tự động loại bỏ hoặc chuyển đổi các ký tự tiếng Việt có dấu thành không dấu.
 *
 * @example
 * <input type="text" appNoVietnamese />
 * <input type="text" appNoVietnamese [removeAccent]="true" /> (chuyển "nguyễn" -> "nguyen")
 */
@Directive({
  selector: '[appNoVietnamese]',
  standalone: true
})
export class NoVietnameseDirective {
  /** Nếu true: Tự động chuyển ký tự có dấu thành không dấu. Nếu false (mặc định): Xóa ký tự có dấu */
  @Input() removeAccent: boolean = true;

  constructor(private el: ElementRef, private ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: InputEvent): void {
    const input = this.el.nativeElement as HTMLInputElement;
    const initialValue = input.value;

    if (!initialValue) return;

    let newValue = initialValue;

    if (this.removeAccent) {
      newValue = this.removeVietnameseTones(initialValue);
    } else {
      // Loại bỏ hoàn toàn ký tự có dấu
      newValue = initialValue.replace(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐà-ỹÀ-Ỹ]/g, '');
    }

    if (initialValue !== newValue) {
      input.value = newValue;
      if (this.ngControl && this.ngControl.control) {
        this.ngControl.control.setValue(newValue, { emitEvent: false });
      }
      event.stopPropagation();
    }
  }

  private removeVietnameseTones(str: string): string {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');

    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
    str = str.replace(/Đ/g, 'D');

    // Kết hợp loại bỏ các diacritical marks bổ sung
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
