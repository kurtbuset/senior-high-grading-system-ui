import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StudentService } from '@app/_services/student.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { first } from 'rxjs';
import { AlertService } from '@app/_services/alert.service';
import { SubjectService } from '@app/_services/subject.service';
import { Subject } from '@app/_models/Subject';

@Component({
  selector: 'students',
  standalone: true,
  templateUrl: 'student-list.component.html',
  imports: [CommonModule, FormsModule],
})
export class StudentListComponent implements OnInit {
  students: any[];
  id: string;

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService,
    private alertService: AlertService,
    private subjectService: SubjectService
  ) {}

  ngOnInit() {
    // teacher_subject_id
    this.id = this.route.snapshot.paramMap.get('id');
    console.log(this.id)
    this.studentService
      .getStudentsByTeacherSubjectId(Number(this.id)) 
      .pipe(first())
      .subscribe((students) => (this.students = students));
  }

  selectAll = false;

  toggleSelectAll() {
    this.students.forEach((student) => {
      student.selected = this.selectAll;
    });
  }

  submitEnrollmentDecisions() {
    const selected = this.students.filter((s) => s.selected);
    console.log(JSON.stringify(selected, null, 2))
    if (selected.length === 0) {
      this.alertService.warn('Please select at least one student.')
      return;
    }
    
    const payload = selected.map((student) => ({
      id: student.enrollment_id,
      name: student.firstName
    }));

    this.alertService.success('student succesfully enrolled boii')
    console.log('Submitting enrollment decisions:', payload);

    // Call your backend API here
    // this.studentService.submitDecisions(payload).subscribe(...)
  }
}
