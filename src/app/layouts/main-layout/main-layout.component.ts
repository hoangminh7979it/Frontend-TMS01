import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ThemeService, ThemeMode } from '@core/services/theme.service';
import { ShipmentService } from '@core/services/shipment.service';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from '@core/services/confirm-dialog.service';

interface MenuItem {
  title: string;
  icon: string;
  link: string;
  badge?: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmDialogComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {

  isSidebarCollapsed: boolean = false;
  currentUser: any = null;
  currentTheme: ThemeMode = 'dark';

  activeShipmentCount: number = 0;
  pendingNotificationCount: number = 0;

  menuItems: MenuItem[] = [
    { title: 'Tổng Quan', icon: 'fa-solid fa-chart-pie', link: '/dashboard' },
    { title: 'Quản Lý Đơn Hàng', icon: 'fa-solid fa-truck-ramp-box', link: '/shipments' },
    { title: 'Quản Lý Khách Hàng', icon: 'fa-solid fa-building-user', link: '/customers' },
    { title: 'Quản Lý Đội Xe', icon: 'fa-solid fa-truck-front', link: '/vehicles' },
    { title: 'Quản Lý Nhân Sự', icon: 'fa-solid fa-users-gear', link: '/employees' },
    { title: 'Quản Lý Chi Phí', icon: 'fa-solid fa-receipt', link: '/expenses' },
    { title: 'Quản Lý Lương', icon: 'fa-solid fa-money-check-dollar', link: '/salaries' },
    { title: 'Báo Cáo Doanh Thu', icon: 'fa-solid fa-chart-line', link: '/revenues' },
    { title: 'Tài Khoản & Quyền', icon: 'fa-solid fa-user-shield', link: '/users' },
    { title: 'Cài Đặt Hệ Thống', icon: 'fa-solid fa-gears', link: '/settings' }
  ];

  constructor(
    private authService: AuthService,
    public themeService: ThemeService,
    private shipmentService: ShipmentService,
    private confirmDialog: ConfirmDialogService,
    private router: Router
  ) {}


  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser() || {
      username: 'admin',
      firstname: 'Quản Trị',
      lastname: 'Hệ Thống',
      roleName: 'Quản Trị Viên (ADMIN)'
    };

    this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    this.loadRealSystemCounts();
  }

  loadRealSystemCounts(): void {
    this.shipmentService.getAllShipments().subscribe({
      next: (res) => {
        const shipments = res.data || [];
        this.activeShipmentCount = shipments.length;
        
        // Count shipments currently in-progress (CREATED, DISPATCHED, PICKED_UP)
        const pendingShipments = shipments.filter(s => s.statusEnumCode !== 'DELIVERED' && s.statusEnumCode !== 'CANCELLED');
        this.pendingNotificationCount = pendingShipments.length;

        // Dynamically set badge for Shipment menu item
        const shipmentMenu = this.menuItems.find(m => m.link === '/shipments');
        if (shipmentMenu) {
          shipmentMenu.badge = this.activeShipmentCount > 0 ? String(this.activeShipmentCount) : undefined;
        }
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onLogout(): void {
    this.confirmDialog.confirm({
      title: 'Xác Nhận Đăng Xuất',
      message: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản lý TMS-01 không?',
      confirmText: 'Đăng Xuất',
      cancelText: 'Hủy Bỏ',
      type: 'warning',
      onConfirm: () => {
        this.authService.logout().subscribe({
          next: () => {
            this.router.navigate(['/login']);
          },
          error: () => {
            this.router.navigate(['/login']);
          }
        });
      }
    });
  }
}

