import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Subject {
  id: number;
  name: string;
  code: string;
  grade_level: string;
  strand: string;
  semester: string;
  school_year: string;
  type: string
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'subject-list.component.html'
})
export class SubjectListComponent implements OnInit {
  // filters
  selectedGradeLevel = '';
  selectedStrand = '';
  selectedSemester = '';
  selectedSchoolYear = '';

  // mock data (later you fetch from backend API)
  subjects: Subject[] = [
    { id: 1, name: 'Oral Communication', code: 'ENGL1', grade_level: '11', strand: 'HUMMS', semester: '1', school_year: '2024-2025', type: 'Core' },
    { id: 2, name: 'Academic Reading and Writing', code: 'ENGL2', grade_level: '11', strand: 'HUMMS', semester: '2', school_year: '2024-2025', type: 'Core' },
  ];

  filteredSubjects: Subject[] = [];

  ngOnInit() {
    this.applyFilters();
  }

  applyFilters() {
    this.filteredSubjects = this.subjects.filter(subj =>
      (!this.selectedGradeLevel || subj.grade_level === this.selectedGradeLevel) &&
      (!this.selectedStrand || subj.strand === this.selectedStrand) &&
      (!this.selectedSemester || subj.semester === this.selectedSemester) &&
      (!this.selectedSchoolYear || subj.school_year === this.selectedSchoolYear)
    );
  }
}
