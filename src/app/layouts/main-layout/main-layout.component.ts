import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ThemeService, ThemeMode } from '@core/services/theme.service';
import { ShipmentService } from '@core/services/shipment.service';
import { VehicleService } from '@core/services/vehicle.service';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from '@core/services/confirm-dialog.service';
import { GlobalToastContainerComponent } from '@shared-ui';
import { formatDateDDMMYYYY } from '@core/services/excel-import-export.service';

interface MenuItem {
  title: string;
  icon: string;
  link: string;
  badge?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'info';
  icon: string;
  link: string;
  timeAgo: string;
  isRead?: boolean;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmDialogComponent, GlobalToastContainerComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit, OnDestroy {

  isSidebarCollapsed: boolean = false;
  currentUser: any = null;
  currentTheme: ThemeMode = 'dark';

  activeShipmentCount: number = 0;
  pendingNotificationCount: number = 0;

  showNotificationDropdown: boolean = false;
  notifications: NotificationItem[] = [];

  // Real-time Clock & Date
  currentDateStr: string = '';
  currentTimeStr: string = '';
  private timerInterval: any;

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
    private vehicleService: VehicleService,
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

    this.startLiveClock();
    this.loadRealSystemNotifications();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  toggleNotificationDropdown(event: Event): void {
    event.stopPropagation();
    this.showNotificationDropdown = !this.showNotificationDropdown;
  }

  closeNotificationDropdown(): void {
    this.showNotificationDropdown = false;
  }

  private getReadNotifIds(): string[] {
    try {
      const stored = localStorage.getItem('tms_read_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveReadNotifIds(ids: string[]): void {
    try {
      localStorage.setItem('tms_read_notifications', JSON.stringify(ids));
    } catch {}
  }

  markNotificationAsRead(n: NotificationItem): void {
    if (!n.isRead) {
      n.isRead = true;
      const readIds = this.getReadNotifIds();
      if (!readIds.includes(n.id)) {
        readIds.push(n.id);
        this.saveReadNotifIds(readIds);
      }
      this.updateUnreadCount();
    }
    this.closeNotificationDropdown();
  }

  markAllNotificationsAsRead(): void {
    const readIds = this.getReadNotifIds();
    this.notifications.forEach(n => {
      n.isRead = true;
      if (!readIds.includes(n.id)) {
        readIds.push(n.id);
      }
    });
    this.saveReadNotifIds(readIds);
    this.updateUnreadCount();
  }

  private updateUnreadCount(): void {
    this.pendingNotificationCount = this.notifications.filter(n => !n.isRead).length;
  }

  loadRealSystemNotifications(): void {
    const notifs: NotificationItem[] = [];
    const readIds = this.getReadNotifIds();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const warnThresholdDate = new Date(today);
    warnThresholdDate.setDate(today.getDate() + 30); // Cảnh báo trước 30 ngày

    // 1. Kiểm tra Xe Tới Hạn Đăng Kiểm & Hạn Bảo Hiểm
    this.vehicleService.getAllVehicles().subscribe({
      next: (res) => {
        const vehicles = res.data || [];
        vehicles.forEach(v => {
          // Hạn đăng kiểm
          if (v.inspectionExpirationDate) {
            const expDate = new Date(v.inspectionExpirationDate);
            expDate.setHours(0, 0, 0, 0);
            const expDateFormatted = formatDateDDMMYYYY(v.inspectionExpirationDate);

            if (expDate < today) {
              const id = `insp-exp-${v.id}`;
              notifs.push({
                id,
                title: `Xe ${v.licensePlate} QUÁ HẠN ĐĂNG KIỂM`,
                message: `Hạn đăng kiểm (${expDateFormatted}) đã hết hạn. Vui lòng đưa xe đi kiểm định ngay!`,
                type: 'danger',
                icon: 'fa-solid fa-triangle-exclamation',
                link: '/vehicles',
                timeAgo: 'Cần xử lý ngay',
                isRead: readIds.includes(id)
              });
            } else if (expDate <= warnThresholdDate) {
              const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
              const id = `insp-warn-${v.id}`;
              notifs.push({
                id,
                title: `Xe ${v.licensePlate} SẮP HẾT HẠN ĐĂNG KIỂM`,
                message: `Hạn đăng kiểm còn ${diffDays} ngày (${expDateFormatted}). Hãy lên kế hoạch kiểm định.`,
                type: 'warning',
                icon: 'fa-solid fa-clipboard-check',
                link: '/vehicles',
                timeAgo: `Còn ${diffDays} ngày`,
                isRead: readIds.includes(id)
              });
            }
          }

          // Hạn bảo hiểm
          if (v.insuranceExpirationDate) {
            const insDate = new Date(v.insuranceExpirationDate);
            insDate.setHours(0, 0, 0, 0);
            const insDateFormatted = formatDateDDMMYYYY(v.insuranceExpirationDate);

            if (insDate < today) {
              const id = `ins-exp-${v.id}`;
              notifs.push({
                id,
                title: `Xe ${v.licensePlate} HẾT HẠN BẢO HIỂM`,
                message: `Bảo hiểm phương tiện (${insDateFormatted}) đã quá hạn. Cần gia hạn bảo hiểm gấp!`,
                type: 'danger',
                icon: 'fa-solid fa-shield-cat',
                link: '/vehicles',
                timeAgo: 'Gia hạn gấp',
                isRead: readIds.includes(id)
              });
            } else if (insDate <= warnThresholdDate) {
              const diffDays = Math.ceil((insDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
              const id = `ins-warn-${v.id}`;
              notifs.push({
                id,
                title: `Xe ${v.licensePlate} SẮP HẾT HẠN BẢO HIỂM`,
                message: `Bảo hiểm phương tiện còn ${diffDays} ngày (${insDateFormatted}).`,
                type: 'warning',
                icon: 'fa-solid fa-shield-halved',
                link: '/vehicles',
                timeAgo: `Còn ${diffDays} ngày`,
                isRead: readIds.includes(id)
              });
            }
          }
        });

        // 2. Kiểm tra Đơn Hàng Đã Qua Ngày Giao Nhưng Chưa Cập Nhật Trạng Thái Giao Hàng
        this.shipmentService.getAllShipments().subscribe({
          next: (shipRes) => {
            const shipments = shipRes.data || [];
            this.activeShipmentCount = shipments.length;

            shipments.forEach(s => {
              if (s.deliveryDate && s.statusEnumCode !== 'DELIVERED' && s.statusEnumCode !== 'CANCELLED') {
                  const delivDate = new Date(s.deliveryDate);
                  delivDate.setHours(0, 0, 0, 0);

                  if (delivDate < today) {
                    const lateDays = Math.ceil((today.getTime() - delivDate.getTime()) / (1000 * 3600 * 24));
                    const id = `shipment-late-${s.shipmentId}`;
                    notifs.push({
                      id,
                      title: `Đơn ${s.shipmentCode} TRỄ NGÀY GIAO HÀNG`,
                      message: `Đơn hàng hẹn giao ngày ${formatDateDDMMYYYY(s.deliveryDate)} (Trễ ${lateDays} ngày) nhưng chưa hoàn thành!`,
                      type: 'danger',
                      icon: 'fa-solid fa-truck-clock',
                      link: '/shipments',
                      timeAgo: `Trễ ${lateDays} ngày`,
                      isRead: readIds.includes(id)
                    });
                }
              }
            });

            this.notifications = notifs;
            this.updateUnreadCount();

            // Dynamically set badge for Shipment menu item
            const shipmentMenu = this.menuItems.find(m => m.link === '/shipments');
            if (shipmentMenu) {
              shipmentMenu.badge = this.activeShipmentCount > 0 ? String(this.activeShipmentCount) : undefined;
            }
          }
        });
      }
    });
  }

  // Close notification dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  clickOut(event: Event) {
    this.showNotificationDropdown = false;
  }

  private startLiveClock(): void {
    this.updateClock();
    this.timerInterval = setInterval(() => {
      this.updateClock();
    }, 1000);
  }

  private updateClock(): void {
    const now = new Date();
    const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = daysOfWeek[now.getDay()];

    const dateNum = String(now.getDate()).padStart(2, '0');
    const monthNum = String(now.getMonth() + 1).padStart(2, '0');
    const yearNum = now.getFullYear();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    this.currentDateStr = `${dayName}, ${dateNum}/${monthNum}/${yearNum}`;
    this.currentTimeStr = `${hours}:${minutes}:${seconds}`;
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

