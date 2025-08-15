import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule],
  // FIX: file actually exists and matches this name
  templateUrl: './student-profile.component.html',
})
export class MyProfileComponent implements OnInit {
  student = {
    id: 'S-001234',
    name: 'Student Name',
    email: 'student@example.com',
    course: 'BS Computer Science',
    yearLevel: '3',
  };

  ngOnInit(): void {}
}
