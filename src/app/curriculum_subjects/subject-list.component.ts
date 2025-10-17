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

  filtersApplied = false;

  currentFilterTextValue = '';


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
    this.filtersApplied = true; // only set when Apply is clicked

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
          // ✅ Update filter text only when Apply is clicked
          this.currentFilterTextValue = `Subjects for ${
            gradeLevel || 'All Grades'
          } - ${strand || 'All Strands'} - ${
            this.selectedSemester
              ? this.selectedSemester === 'FIRST SEMESTER'
                ? '1st Semester'
                : '2nd Semester'
              : 'All Semesters'
          } - ${schoolYear || 'All Years'}`;
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
    this.filtersApplied = false;
  }

  openSetSubjectsModal() {
    this.showSetSubjectsModal = true;
    if (this.selectedSubjects.length === 0) {
      this.addSubject(); // pre-add a blank row
    }
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

  deleteSubject(curriculumSubjectId: number) {
    if (!curriculumSubjectId) return;

    if (!confirm('Are you sure you want to delete this subject?')) return;

    this.subjectService
      .deleteSubject(curriculumSubjectId)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Subject removed successfully!');
          // Refresh the filtered list
          this.applyFilters();
        },
        error: (err) => {
          console.error('Error deleting subject:', err);
          if (err.error?.message) {
            this.alertService.error(err.error.message);
          } else {
            this.alertService.error('Failed to remove subject. A teacher was assigned to this subject.');
          }
        },
      });
  }

  get currentFilterText(): string {
    if (!this.filtersApplied) return '';

    const gradeLevel =
      this.gradeLevels.find((g) => g.id == this.selectedGradeLevelId)?.level ||
      'All Grades';
    const strand =
      this.strands.find((s) => s.id == this.selectedStrandId)?.name ||
      'All Strands';
    const semester = this.selectedSemester
      ? this.selectedSemester === 'FIRST SEMESTER'
        ? '1st Semester'
        : '2nd Semester'
      : 'All Semesters';
    const schoolYear =
      this.schoolYears.find((sy) => sy.id == this.selectedSchoolYearId)
        ?.school_year || 'All Years';

    return `Subjects for ${gradeLevel} - ${strand} - ${semester} - ${schoolYear}`;
  }
}
