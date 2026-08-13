import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShipmentService } from '@core/services/shipment.service';
import { VehicleService } from '@core/services/vehicle.service';
import { ExpenseService } from '@core/services/expense.service';
import { RevenueService } from '@core/services/revenue.service';
import { ShipmentModel } from '@core/models/shipment.model';
import { VehicleModel } from '@core/models/vehicle.model';
import { ExpenseModel } from '@core/models/expense.model';

import {
  TmsPageHeaderComponent,
  TmsMetricCardComponent,
  TmsTablePanelComponent
} from '@shared-ui';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TmsPageHeaderComponent,
    TmsMetricCardComponent,
    TmsTablePanelComponent
  ],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {

  loading: boolean = true;

  // Real KPI Metrics
  totalShipmentsToday: number = 0;
  activeVehiclesCount: number = 0;
  totalVehiclesCount: number = 0;
  monthlyGrossRevenue: number = 0;
  monthlyExpenses: number = 0;

  // Real Data Lists
  recentShipments: ShipmentModel[] = [];
  recentActivities: { icon: string; bgClass: string; title: string; subtitle: string }[] = [];

  // Comparison Chart Data (3 Months)
  monthlyFinancials: { monthLabel: string; grossRevenue: number; totalExpenses: number; netProfit: number }[] = [];
  maxChartValue: number = 1000000;
  Math = Math;

  constructor(
    private shipmentService: ShipmentService,
    private vehicleService: VehicleService,
    private expenseService: ExpenseService,
    private revenueService: RevenueService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.recentActivities = [];

    // Load Shipments
    this.shipmentService.getAllShipments().subscribe({
      next: (res) => {
        const shipments = res.data || [];
        
        // Filter recent 5 shipments
        this.recentShipments = shipments.slice(0, 5);

        // Count today shipments
        const todayStr = new Date().toISOString().substring(0, 10);
        this.totalShipmentsToday = shipments.filter(s => 
          s.dateOfReceipt && s.dateOfReceipt.substring(0, 10) === todayStr
        ).length;

        // Calculate gross revenue
        this.monthlyGrossRevenue = shipments.reduce((sum, s) => sum + (s.revenue || 0), 0);

        // Build activity log from latest shipments
        shipments.slice(0, 3).forEach(s => {
          this.recentActivities.push({
            icon: 'fa-solid fa-truck-arrow-right',
            bgClass: 'bg-blue',
            title: `Đơn ${s.shipmentCode} — ${s.receiptPlace || 'Nơi nhận'} → ${s.deliveryPlace || 'Nơi giao'}`,
            subtitle: `Tài xế: ${s.driverName || 'Chưa gán'} • Xe: ${s.licensePlate || 'N/A'}`
          });
        });

        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    // Load Vehicles
    this.vehicleService.getAllVehicles().subscribe({
      next: (res) => {
        const vehicles = res.data || [];
        this.totalVehiclesCount = vehicles.length;
        this.activeVehiclesCount = vehicles.filter(v => v.status === 'AVAILABLE' || v.status === 'IN_TRANSIT').length;
      }
    });

    // Load Expenses
    this.expenseService.getAllExpenses().subscribe({
      next: (res) => {
        const expenses = res.data || [];
        this.monthlyExpenses = expenses.reduce((sum, e) => sum + (e.totalExpense || 0), 0);

        // Add expense activities
        expenses.slice(0, 2).forEach(e => {
          this.recentActivities.push({
            icon: 'fa-solid fa-gas-pump',
            bgClass: 'bg-yellow',
            title: `Chi phí ${e.expenseCode}: ${e.title || 'Phát sinh vận hành'}`,
            subtitle: `${(e.totalExpense || 0).toLocaleString('en-US')} VNĐ • Xe: ${e.vehicleLicensePlate || 'Chưa gán'}`
          });
        });

        // Generate 3 months chart comparison
        this.generate3MonthsComparison();
      }
    });
  }

  generate3MonthsComparison(): void {
    // Lấy mốc tháng hiện tại theo thời gian thực hệ thống
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0 - 11

    // Tạo mốc 3 tháng liên tiếp tính từ tháng hiện tại lùi về 2 tháng trước (VD: Tháng 6, 7, 8 năm 2026)
    const months: { year: number; month: number; monthLabel: string }[] = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // 1 - 12
      months.push({
        year,
        month,
        monthLabel: `Tháng ${month}/${year}`
      });
    }

    // Nhóm dữ liệu Đơn hàng (Shipments) & Chi phí (Expenses) theo 3 tháng này
    this.shipmentService.getAllShipments().subscribe({
      next: (shipRes) => {
        const shipments = shipRes.data || [];
        this.expenseService.getAllExpenses().subscribe({
          next: (expRes) => {
            const expenses = expRes.data || [];

            this.monthlyFinancials = months.map(m => {
              const mShipments = shipments.filter(s => {
                if (!s.dateOfReceipt) return false;
                const sDate = new Date(s.dateOfReceipt);
                return sDate.getFullYear() === m.year && (sDate.getMonth() + 1) === m.month;
              });

              const mExpenses = expenses.filter(e => {
                if (!e.createDate) return false;
                const eDate = new Date(e.createDate);
                return eDate.getFullYear() === m.year && (eDate.getMonth() + 1) === m.month;
              });

              const grossRevenue = mShipments.reduce((sum, s) => sum + (s.revenue || 0), 0);
              const totalExpenses = mExpenses.reduce((sum, e) => sum + (e.totalExpense || 0), 0);
              const netProfit = grossRevenue - totalExpenses;

              return {
                monthLabel: m.monthLabel,
                grossRevenue,
                totalExpenses,
                netProfit
              };
            });

            // Calculate max value for SVG bar scaling
            const allVals = this.monthlyFinancials.flatMap(f => [f.grossRevenue, f.totalExpenses, Math.abs(f.netProfit)]);
            const maxVal = Math.max(...allVals, 100000);
            this.maxChartValue = Math.ceil(maxVal * 1.2);
          }
        });
      }
    });
  }
}
