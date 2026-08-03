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

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
      }
    });
  }
}
