import { Component, OnInit } from '@angular/core';
import { AccountService } from '@app/_services/account.service';
import { StudentService } from '@app/_services/student.service';
import { first } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationSocketService } from '@app/_services/notification-socket.service';

@Component({
  standalone: true,
  templateUrl: 'egrade.component.html',
  imports: [CommonModule, FormsModule],
})
export class EgradeComponent implements OnInit {
  account_id = this.accountService.accountValue.id;
  subjects: any[] = [];
  selectedSemester: string = '';
  schoolYear: string;

  constructor(
    private accountService: AccountService,
    private studentService: StudentService,
    private notifSocket: NotificationSocketService
  ) {}

  ngOnInit(): void {
    // Initial fetch
    this.studentService
      .getSubjectsAndGrades(Number(this.account_id))
      .pipe(first())
      .subscribe({
        next: (res) => {
          this.schoolYear = res.schoolYear;
          this.subjects = res.subjects;
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });

    // 🔔 Listen for grade updates
    this.notifSocket.onGradeUpdated((update) => {
      console.log('📊 Grade update received:', update);

      // Update the subject in place
      const subject = this.subjects.find((s) => s.id === update.subjectId);
      if (subject) {
        if (update.quarter === 'First Quarter') {
          subject.firstQuarter = update.final_grade;
        }
        if (update.quarter === 'Second Quarter') {
          subject.secondQuarter = update.final_grade;
        }

        // Recalculate average
        if (subject.firstQuarter != null && subject.secondQuarter != null) {
          subject.finalAverage =
            (subject.firstQuarter + subject.secondQuarter) / 2;
        }
      }
    });
  }

  get filteredSubjects() {
    if (!this.selectedSemester) return [];
    return this.subjects.filter((s) =>
      s.semester.toLowerCase().includes(this.selectedSemester.toLowerCase())
    );
  }

  get hasSecondSemSubjects() {
    return this.subjects.some((s) =>
      s.semester.toLowerCase().includes('second')
    );
  }
}
