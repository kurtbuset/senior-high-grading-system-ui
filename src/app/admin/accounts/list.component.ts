import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SubjectService } from '@app/_services/subject.service';
import { Subject } from '@app/_models/Subject';

@Component({
  standalone: true,
  selector: 'app-subject-list',
  templateUrl: './list.component.html',
  imports: [CommonModule, RouterModule],
})
export class ListComponent implements OnInit {
  subjects: Subject[] = [];
  teacherId = 1; // Use actual logged-in user's ID if available

  constructor(private subjectService: SubjectService) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.subjectService.getAllSubjects(this.teacherId).subscribe({
      next: (data) => (this.subjects = data),
      error: (err) => console.error('Failed to load subjects:', err),
    });
  }

  deleteSubject(id: number): void {
    if (confirm('Are you sure you want to delete this subject?')) {
      this.subjectService.deleteSubject(id).subscribe(() => {
        this.loadSubjects(); // Refresh list after deletion
      });
    }
  }
}
