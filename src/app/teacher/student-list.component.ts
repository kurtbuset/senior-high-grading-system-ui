import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StudentService } from '@app/_services/student.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { first } from 'rxjs';
import { AlertService } from '@app/_services/alert.service';
import { SubjectService } from '@app/_services/subject.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'students',
  standalone: true,
  templateUrl: 'student-list.component.html',
  imports: [CommonModule, FormsModule, RouterModule],
})
export class StudentListComponent implements OnInit {
  students: any[] = [];
  id: string;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService,
    private alertService: AlertService,
    private subjectService: SubjectService
  ) {}

  ngOnInit() {
    // teacher_subject_id
    this.isLoading = true;
    this.id = this.route.snapshot.paramMap.get('id');
    // console.log(this.id)
    this.studentService
      .getStudentsByTeacherSubjectId(Number(this.id))
      .pipe(first())
      .subscribe({
        next: (students) => {
          this.students = students;
          this.isLoading = false;
        },
        error: (err) => {
          this.alertService.error(err);
          this.isLoading = false;
        },
      });

    this.subjectService.getOneSubject(Number(this.id)).subscribe((subject) => {
      console.log('before: ', this.subjectService.subjectValue);
      this.subjectService.subjectSubject.next(subject);
      console.log('after: ', this.subjectService.subjectValue);
    });
  }

  selectAll = false;

  toggleSelectAll() {
    this.students.forEach((student) => {
      student.selected = this.selectAll;
    });
  }

  submitEnrollmentDecisions() {
    const selected = this.students.filter((s) => s.selected);
    // console.log(JSON.stringify(selected, null, 2))
    if (selected.length === 0) {
      this.alertService.error('Please select at least one student.');
      return;
    }

    const payload = selected.map((student) => ({
      id: student.enrollment_id,
    }));

    // this.alertService.success('student succesfully enrolled boii')
    // console.log('Submitting enrollment decisions:', payload);

    this.studentService
      .updateStudentEnrollment(Number(this.id), payload)
      .subscribe({
        next: (res: any) => {
          console.log(res.message);
          this.alertService.success(res.message);
          this.ngOnInit();
        },
        error: (error) => {
          this.alertService.error(error);
        },
      });
  }
}
