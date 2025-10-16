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
  selectedGradeLevelId = '';
  selectedStrandId = '';
  selectedSemester = '';
  selectedSchoolYearId = '';

  gradeLevels: any[] = [];
  strands: any[] = [];
  schoolYears: any[] = [];

  subjects: any[] = [];
  filteredSubjects: any[] = [];
  allSubjects: any[] = [];

  showSetSubjectsModal = false;
  selectedSubjects: any[] = [];

  
  constructor(
    private subjectService: SubjectService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.loadDropdownData();
    this.loadSubjects();
  }

  

  loadDropdownData() {
    this.subjectService
      .getGradeLevels()
      .pipe(first())
      .subscribe({
        next: (data) => (this.gradeLevels = data),
      });

    this.subjectService
      .getStrands()
      .pipe(first())
      .subscribe({
        next: (data) => (this.strands = data),
      });

    this.subjectService
      .getSchoolYears()
      .pipe(first())
      .subscribe({
        next: (data) => (this.schoolYears = data),
      });
  }

  loadSubjects() {
    this.subjectService
      .getAllSubjects()
      .pipe(first())
      .subscribe({
        next: (subjects) => {
          this.subjects = subjects;
          this.filteredSubjects = subjects;
          this.allSubjects = subjects.map((s: any) => ({
            ...s,
            selected: false,
          }));
        },
      });
  }

  applyFilters() {
    // Find the actual values instead of IDs
    const gradeLevel =
      this.gradeLevels.find((g) => g.id == this.selectedGradeLevelId)?.level ||
      '';
    const strand =
      this.strands.find((s) => s.id == this.selectedStrandId)?.code || '';
    const schoolYear =
      this.schoolYears.find((sy) => sy.id == this.selectedSchoolYearId)
        ?.school_year || '';

    const obj = {
      grade_level: gradeLevel,
      strand: strand,
      semester: this.selectedSemester,
      school_year: schoolYear,
    };

    console.log('🧩 Sending filter VALUES instead of IDs:', obj);

    this.subjectService
      .getFilteredSubjects(obj)
      .pipe(first())
      .subscribe({
        next: (filteredSubjects) => {
          this.filteredSubjects = filteredSubjects;
        },
        error: (err) => {
          console.log('error!', err);
        },
      });
  }

  resetFilters() {
    this.selectedGradeLevelId = '';
    this.selectedStrandId = '';
    this.selectedSemester = '';
    this.selectedSchoolYearId = '';
    this.filteredSubjects = this.subjects;
  }

  openSetSubjectsModal() {
    this.showSetSubjectsModal = true;
    this.selectedSubjects = [];
  }

  closeModal() {
    this.showSetSubjectsModal = false;
    this.selectedSubjects = [];
  }

  addSubject() {
    this.selectedSubjects.push({
      subject_id: '',
      grade_level_id: this.selectedGradeLevelId || null,
      strand_id: this.selectedStrandId || null,
      semester: this.selectedSemester || null,
      school_year_id: this.selectedSchoolYearId || null,
    });
  }

  removeSubject(index: number) {
    this.selectedSubjects.splice(index, 1);
  }

  saveSubjects() {
    const payload = this.selectedSubjects.map((s) => ({
      subject_id: s.subject_id,
      grade_level_id: this.selectedGradeLevelId || null,
      strand_id: this.selectedStrandId || null,
      semester: this.selectedSemester || null,
      school_year_id: this.selectedSchoolYearId || null,
    }));

    console.log('✅ Subjects to Save (IDs):', payload);

    this.subjectService
      .saveSubjects(payload)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Subjects saved successfully!');
          // ✅ Refresh the filtered list immediately
          this.applyFilters();

          // ✅ Close modal
          this.closeModal();
        },
        error: (err) => {
          console.error('❌ Error saving subjects:', err);
          this.alertService.error('Failed to save subjects');
        },
      });
  }

  
}
