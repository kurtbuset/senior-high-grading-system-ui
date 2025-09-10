import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'superadmin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h1 class="mb-0 h4">SuperAdmin Dashboard</h1>
          <p class="mb-0 opacity-75">System Administration Panel</p>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-12">
              <h5>Welcome to SuperAdmin Panel</h5>
              <p class="text-muted">Manage system-wide configurations and advanced settings.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SuperAdminDashboardComponent {}