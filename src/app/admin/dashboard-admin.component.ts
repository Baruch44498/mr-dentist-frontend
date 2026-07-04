import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardAdminService } from '../services/dashboard-admin.service';
import { AdminDashboardStats } from '../models/dashboard';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-admin.component.html'
})
export class DashboardAdminComponent implements OnInit {
  private dashboardAdminService = inject(DashboardAdminService);

  stats = signal<AdminDashboardStats | null>(null);
  isLoading = signal<boolean>(false);

  ngOnInit() {
    this.cargarStats();
  }

  cargarStats() {
    this.isLoading.set(true);
    this.dashboardAdminService.obtenerStats().subscribe({
      next: (res: AdminDashboardStats) => {
        this.stats.set(res);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
