import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubjectService } from '@app/_services/subject.service';
import { first } from 'rxjs';
import { AlertService } from '@app/_services/alert.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'subject-list.component.html',
})
export class SubjectListComponent implements OnInit {
  // filters
  selectedGradeLevel = '';
  selectedStrand = '';
  selectedSemester = '';
  selectedSchoolYear = '';

  filteredSubjects: any[] = [];
  subjects: any[] = [];

  constructor(
    private subjectService: SubjectService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.subjectService
      .getAllSubjects()
      .pipe(first())
      .subscribe({
        next: (subjects) => {
          this.filteredSubjects = subjects;
        },
      });
  }

  applyFilters() {
    const obj = {
      grade_level: this.selectedGradeLevel,
      strand: this.selectedStrand,
      semester: this.selectedSemester,
      school_year: this.selectedSchoolYear,
    };

    this.subjectService
      .getFilteredSubjects(obj)
      .pipe(first())
      .subscribe({
        next: (filteredSubjects) => {
          this.filteredSubjects = filteredSubjects;
        },
        error: (err) => {
          console.log('error! ', err);
        },
      });

    this.filteredSubjects = this.subjects.filter(
      (subj) =>
        (!this.selectedGradeLevel ||
          subj.grade_level === this.selectedGradeLevel) &&
        (!this.selectedStrand || subj.strand === this.selectedStrand) &&
        (!this.selectedSemester || subj.semester === this.selectedSemester) &&
        (!this.selectedSchoolYear ||
          subj.school_year === this.selectedSchoolYear)
    );
  }

  resetFilters() {
    this.selectedGradeLevel = '';
    this.selectedStrand = '';
    this.selectedSemester = '';
    this.selectedSchoolYear = '';
    this.filteredSubjects = []
    this.applyFilters()
  }

  setSubjects() {
    console.log('Set Subjects button clicked!');
    // 👉 Add your logic here (e.g., open modal, navigate to form, etc.)
  }
}
