import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  /**
   * Trả về Base URL linh hoạt cho API:
   * - Nếu chạy trong môi trường Docker / Production (trình duyệt có origin): Dùng relative path '/api/v1'
   *   (được Nginx Reverse Proxy điều hướng thẳng tới Backend container mà không lo khác IP/Port)
   * - Nếu chạy local ng serve độc lập: Dùng 'http://localhost:8080/api/v1'
   */
  public get baseUrl(): string {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return '/api/v1';
    }
    return '/api/v1';
  }
}
