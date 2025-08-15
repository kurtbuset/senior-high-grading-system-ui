import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountService } from '@app/_services/account.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats = {
    totalAccounts: 0,
    totalSubjects: 0,
    totalAssignments: 0,
    activeUsers: 0
  };

  recentActivities: any[] = [];

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Mock data for dashboard
    this.stats = {
      totalAccounts: 42,
      totalSubjects: 128,
      totalAssignments: 36,
      activeUsers: 28
    };

    this.recentActivities = [
      { action: 'User Registered', description: 'New teacher account created', time: '2 hours ago' },
      { action: 'Subject Added', description: 'Mathematics subject added', time: '5 hours ago' },
      { action: 'Assignment Created', description: 'Teacher assigned to subject', time: '1 day ago' },
      { action: 'User Updated', description: 'Student profile updated', time: '2 days ago' }
    ];
  }
}