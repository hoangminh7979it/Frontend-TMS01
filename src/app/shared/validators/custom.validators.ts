import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator kiểm tra không được chứa tiếng Việt có dấu.
 */
export function noVietnameseValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐà-ỹÀ-Ỹ]/.test(control.value);
    return hasVietnamese ? { vietnameseNotAllowed: true } : null;
  };
}

/**
 * Validator kiểm tra số điện thoại Việt Nam chuẩn (10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09).
 */
export function vietnamPhoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const validPhone = /^(03|05|07|08|09)\d{8}$/.test(control.value.trim());
    return validPhone ? null : { invalidPhone: true };
  };
}

/**
 * Validator kiểm tra biển số xe tải / container Việt Nam.
 * Cấu trúc chuẩn: 2 số + 1-2 chữ + 4-5 số (VD: 51C-123.45, 29H-9999).
 */
export function licensePlateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const raw = control.value.replace(/[^A-Za-z0-9]/g, '');
    const valid = /^\d{2}[A-Z]{1,2}\d{4,5}$/i.test(raw);
    return valid ? null : { invalidLicensePlate: true };
  };
}

/**
 * Validator kiểm tra định dạng mã (Mã Đơn Hàng, Mã Nhân Viên, Mã Khách Hàng...).
 * Chỉ cho phép Chữ cái KHÔNG DẤU, Chữ số, dấu gạch ngang (-) và gạch dưới (_).
 */
export function codeFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const valid = /^[A-Za-z0-9\-_]+$/.test(control.value);
    return valid ? null : { invalidCodeFormat: true };
  };
}

/**
 * Validator kiểm tra không được chứa 2 hoặc nhiều khoảng trắng liên tiếp.
 */
export function noConsecutiveSpacesValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const hasDoubleSpace = / {2,}/.test(control.value);
    return hasDoubleSpace ? { consecutiveSpacesNotAllowed: true } : null;
  };
}

/**
 * Validator kiểm tra không được chứa ký tự đặc biệt.
 */
export function noSpecialCharsValidator(allowDash: boolean = false, allowDot: boolean = false): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    let allowedPattern = 'a-zA-Z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐÀ-Ỹ\\s';
    if (allowDash) allowedPattern += '\\-_';
    if (allowDot) allowedPattern += '\\.,';

    const regex = new RegExp(`[^${allowedPattern}]`);
    const hasSpecialChars = regex.test(control.value);
    return hasSpecialChars ? { specialCharsNotAllowed: true } : null;
  };
}
