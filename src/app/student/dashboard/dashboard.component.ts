import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  student = {
    name: 'John Doe',
    id: 'S-001234',
    course: 'BS Computer Science',
    yearLevel: '3rd Year',
    section: 'A'
  };

  quickLinks = [
    { title: 'E-Grade', icon: 'fas fa-graduation-cap', route: '/student/e-grade', color: 'primary' },
    { title: 'My Profile', icon: 'fas fa-user', route: '/student/my-profile', color: 'success' },
    { title: 'Modify Account', icon: 'fas fa-user-edit', route: '/student/modify-account', color: 'info' }
  ];

  recentActivities = [
    { action: 'Grade Updated', description: 'Your Mathematics grade has been updated.', time: '3 days ago' },
    { action: 'Profile Updated', description: 'Your profile information was successfully updated.', time: '1 week ago' },
    { action: 'New Subject Assigned', description: 'You have been assigned to Physics 101.', time: '2 weeks ago' },
    { action: 'Assignment Posted', description: 'New assignment posted in Computer Science.', time: '3 weeks ago' }
  ];

  ngOnInit(): void {
    // Initialize dashboard data
  }
}