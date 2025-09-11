import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GradingService } from '@app/_services/grading.service';
import { first } from 'rxjs';
import { AccountService } from '@app/_services/account.service';
import { AlertService } from '@app/_services/alert.service';

@Component({
  standalone: true,
  templateUrl: 'subject-list.component.html',
  imports: [CommonModule],
})
export class SubjectListComponent implements OnInit {
  history: any[] = [];
  homeroom_id: string;
  selectedRecord: any = null;

  showRequestModal = false; // 👈 Angular-driven modal flag

  account = this.accountService.accountValue;

  constructor(
    private route: ActivatedRoute,
    private gradingService: GradingService,
    private accountService: AccountService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.route.parent?.paramMap.subscribe((params) => {
      this.homeroom_id = params.get('id')!;
    });

    this.gradingService
      .getSubjectsLockingHistory(Number(this.homeroom_id))
      .pipe(first())
      .subscribe({
        next: (results) => {
          console.log(results);
          this.history = results;
        },
        error: (err) => {
          console.log('Error: ', err);
        },
      });
  }

  openRequestModal(record: any) {
    this.selectedRecord = record;
    this.showRequestModal = true;
  }

  closeRequestModal() {
    this.showRequestModal = false;
    this.selectedRecord = null;
  }

  respondToRequest(status: 'UNLOCKED' | 'LOCKED') {
    if (!this.selectedRecord) return;

    this.gradingService
      .updateSubjectStatus(this.selectedRecord.assignment_id, {
        status,
        quarter: this.selectedRecord.quarter,
      })
      .pipe(first())
      .subscribe({
        next: () => {
          // update UI after decision
          this.selectedRecord.lock_status = status;
          this.alertService.success('hell yeah');
          this.closeRequestModal();
        },
        error: (err) => {
          console.error('Failed to update subject status:', err);
        },
      });
  }
}
