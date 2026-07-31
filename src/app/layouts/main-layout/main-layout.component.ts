import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ThemeService, ThemeMode } from '@core/services/theme.service';

interface MenuItem {
  title: string;
  icon: string;
  link: string;
  badge?: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {

  isSidebarCollapsed: boolean = false;
  currentUser: any = null;
  currentTheme: ThemeMode = 'dark';

  menuItems: MenuItem[] = [
    { title: 'Tổng Quan', icon: 'fa-solid fa-chart-pie', link: '/dashboard' },
    { title: 'Quản Lý Đơn Hàng', icon: 'fa-solid fa-truck-ramp-box', link: '/shipments', badge: '12' },
    { title: 'Quản Lý Khách Hàng', icon: 'fa-solid fa-building-user', link: '/customers' },
    { title: 'Quản Lý Đội Xe', icon: 'fa-solid fa-truck-front', link: '/vehicles' },
    { title: 'Quản Lý Nhân Sự', icon: 'fa-solid fa-users-gear', link: '/employees' },
    { title: 'Quản Lý Chi Phí', icon: 'fa-solid fa-receipt', link: '/expenses' },
    { title: 'Lương & Doanh Thu', icon: 'fa-solid fa-wallet', link: '/finance' },
    { title: 'Tài Khoản & Quyền', icon: 'fa-solid fa-user-shield', link: '/users' },
    { title: 'Cài Đặt Hệ Thống', icon: 'fa-solid fa-gears', link: '/settings' }
  ];

  constructor(
    private authService: AuthService,
    public themeService: ThemeService,
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
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }
}
