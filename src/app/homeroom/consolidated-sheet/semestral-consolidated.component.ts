import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HomeroomService } from '@app/_services/homeroom.service';
import { first } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AccountService } from '@app/_services/account.service';
import { SubjectService } from '@app/_services/subject.service';
import { FormsModule } from '@angular/forms';
import { AlertComponent } from '@app/_components/alert.component';
import { AlertService } from '@app/_services/alert.service';

@Component({
  templateUrl: 'semestral-consolidated.component.html',
  styleUrls: ['semestral-consolidated.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SemestralConsolidatedComponent implements OnInit {
  semester: string;
  loading: boolean = false;
  homeroomId: string;
  sheet: any;
  teachers: any[] = [];

  showTeacherModal = false;
  selectedSubject: any = null;
  isUpdateMode: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private homeroomService: HomeroomService,
    private accountService: AccountService,
    private subjectService: SubjectService,
    private alertService: AlertService
  ) {
    this.route.parent?.paramMap.subscribe((params) => {
      this.homeroomId = params.get('id')!;
      console.log('homeroom id: ', this.homeroomId);
    });
  }

  ngOnInit() {
    this.loading = true;

    this.route.paramMap.subscribe((params) => {
      this.semester = params.get('semester')!;

      this.homeroomService
        .getConsolidatedSheet(this.homeroomId, { semester: this.semester })
        .pipe(first())
        .subscribe({
          next: (sheet) => {
            this.sheet = sheet;
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading conso sheet:', error);
            this.loading = false;
          },
        });

      this.accountService
        .getAllTeachers()
        .pipe(first())
        .subscribe({
          next: (teachers) => {
            this.teachers = teachers;
          },
          error: (error) => console.error('Error loading teachers:', error),
        });
      console.log('semester: ', this.semester);
    });
  }

  openTeacherModal(subj: any) {
    this.selectedSubject = { ...subj }; // clone to avoid live changes
    this.isUpdateMode = !!subj.teacherId; // true if already has a teacher
    this.showTeacherModal = true;
  }

  closeTeacherModal() {
    this.showTeacherModal = false;
    this.selectedSubject = null;
    this.isUpdateMode = false;
  }

  saveTeacherAssignment() {
    if (!this.selectedSubject?.teacherId) return;

    const payload = {
      homeroom_id: Number(this.homeroomId),
      teacher_id: this.selectedSubject.teacherId,
      curriculum_subject_id: this.selectedSubject.curriculum_subject_id,
      action: this.isUpdateMode ? 'update' : 'assign',
    };

    console.log(payload);
    this.subjectService
      .assignSubjectToTeacher(payload)
      .pipe(first())
      .subscribe({
        next: (res) => {
          console.log('✅ Saved:', res);
          this.alertService.success('Subject successfully assigned to teacher.');
          // update local sheet so UI refreshes without reload
          const subjIndex = this.sheet.subjects.findIndex(
            (s: any) =>
              s.curriculum_subject_id ===
              this.selectedSubject.curriculum_subject_id
          );

          if (subjIndex > -1) {
            this.sheet.subjects[subjIndex].teacher =
              this.teachers.find((t) => t.id === this.selectedSubject.teacherId)
                ?.firstName +
              ' ' +
              this.teachers.find((t) => t.id === this.selectedSubject.teacherId)
                ?.lastName;
            this.sheet.subjects[subjIndex].teacherId =
              this.selectedSubject.teacherId;
          }

          this.closeTeacherModal();
        },
        error: (err) => {
          console.error('❌ Error saving:', err);
        },
      });
  }
}
