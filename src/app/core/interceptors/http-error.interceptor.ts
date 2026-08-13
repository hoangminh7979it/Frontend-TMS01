import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '@core/services/toast.service';

/**
 * HttpErrorInterceptor
 *
 * Tự động chặn và trích xuất tất cả phản hồi lỗi từ Backend (Backend-TMS01),
 * tự động kích hoạt Toast đỏ trượt từ bên phải ra hiển thị đúng câu thông báo lỗi tiếng Việt từ Backend.
 */
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private toastService: ToastService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Đã có lỗi xảy ra trong quá trình xử lý.';
        let errorTitle = 'Lỗi hệ thống';

        if (error.error) {
          // Trích xuất thông báo lỗi từ Backend JSON Response
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.error) {
            errorMessage = error.error.error;
          } else if (Array.isArray(error.error.errors) && error.error.errors.length > 0) {
            errorMessage = error.error.errors.join(', ');
          }
        }

        // Đặt tiêu đề tương ứng với mã HTTP Status
        switch (error.status) {
          case 400:
            errorTitle = 'Dữ liệu không hợp lệ (400)';
            break;
          case 401:
            errorTitle = 'Phiên làm việc hết hạn (401)';
            errorMessage = errorMessage || 'Vui lòng đăng nhập lại.';
            break;
          case 403:
            errorTitle = 'Không có quyền truy cập (403)';
            break;
          case 404:
            errorTitle = 'Không tìm thấy dữ liệu (404)';
            break;
          case 409:
            errorTitle = 'Dữ liệu bị trùng lặp (409)';
            break;
          case 500:
            errorTitle = 'Lỗi máy chủ Backend (500)';
            break;
          case 0:
            errorTitle = 'Mất kết nối máy chủ';
            errorMessage = 'Không thể kết nối tới Backend-TMS01. Vui lòng kiểm tra mạng.';
            break;
        }

        // Tự động kích hoạt Toast đỏ nổi bên phải màn hình
        this.toastService.error(errorMessage, errorTitle, 6000);

        return throwError(() => error);
      })
    );
  }
}
