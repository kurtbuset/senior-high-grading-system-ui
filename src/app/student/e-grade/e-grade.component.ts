import { Component, OnInit } from '@angular/core';

interface Grade {
  subject: string;
  midterm: number;
  finals: number;
}

@Component({
  selector: 'app-e-grade',
  templateUrl: './e-grade.component.html',
  styleUrls: ['./e-grade.component.css']
})
export class EGradeComponent implements OnInit {
  grades: Grade[] = [];

  ngOnInit(): void {
    // Sample static data — replace with API call
    this.grades = [
      { subject: 'Mathematics', midterm: 88, finals: 90 },
      { subject: 'Science', midterm: 85, finals: 87 },
      { subject: 'English', midterm: 92, finals: 91 },
      { subject: 'History', midterm: 78, finals: 82 },
      { subject: 'Physical Education', midterm: 95, finals: 93 }
    ];
  }

  getFinalGrade(grade: Grade): number {
    return (grade.midterm + grade.finals) / 2;
  }

  getGradeStatus(grade: number): string {
    if (grade >= 90) return 'bg-success';
    if (grade >= 80) return 'bg-primary';
    if (grade >= 75) return 'bg-warning';
    return 'bg-danger';
  }

  getGradeStatusText(grade: number): string {
    if (grade >= 90) return 'Excellent';
    if (grade >= 80) return 'Good';
    if (grade >= 75) return 'Fair';
    return 'Poor';
  }
}
