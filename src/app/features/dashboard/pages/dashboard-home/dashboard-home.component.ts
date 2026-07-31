import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {

  metrics = [
    {
      title: 'ĐƠN HÀNG HÔM NAY',
      value: '28',
      unit: 'Đơn',
      trend: '+12%',
      isPositive: true,
      icon: 'fa-solid fa-truck-loading',
      color: '#3b82f6'
    },
    {
      title: 'XE ĐANG VẬN CHUYỂN',
      value: '18 / 24',
      unit: 'Xe',
      trend: '82% Công suất',
      isPositive: true,
      icon: 'fa-solid fa-route',
      color: '#10b981'
    },
    {
      title: 'DOANH THU THÁNG',
      value: '450.500.000',
      unit: 'VNĐ',
      trend: '+8.5%',
      isPositive: true,
      icon: 'fa-solid fa-sack-dollar',
      color: '#8b5cf6'
    },
    {
      title: 'CHI PHÍ PHÁT SINH',
      value: '32.400.000',
      unit: 'VNĐ',
      trend: '-3.1%',
      isPositive: true,
      icon: 'fa-solid fa-gas-pump',
      color: '#f59e0b'
    }
  ];

  recentShipments = [
    { code: 'DH-687901', driver: 'Nguyễn Văn Hùng', licensePlate: '29C-888.99', from: 'Hà Nội', to: 'Hải Phòng', status: 'Đang Giao', date: '31/07/2026' },
    { code: 'DH-687902', driver: 'Trần Đình Nam', licensePlate: '30E-123.45', from: 'Đà Nẵng', to: 'Quy Nhơn', status: 'Chờ Xử Lý', date: '31/07/2026' },
    { code: 'DH-687903', driver: 'Lê Hoàng Long', licensePlate: '51D-999.88', from: 'TP. Hồ Chí Minh', to: 'Bình Dương', status: 'Hoàn Thành', date: '30/07/2026' },
    { code: 'DH-687904', driver: 'Phạm Đức Anh', licensePlate: '60C-555.12', from: 'Đồng Nai', to: 'Cần Thơ', status: 'Đang Giao', date: '30/07/2026' }
  ];

  ngOnInit(): void {}
}
