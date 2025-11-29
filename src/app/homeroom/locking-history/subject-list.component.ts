import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GradingService } from '@app/_services/grading.service';
import { first } from 'rxjs';
import { AccountService } from '@app/_services/account.service';
import { AlertService } from '@app/_services/alert.service';
import { FormsModule } from '@angular/forms'; // ⬅️ add this

@Component({
  standalone: true,
  templateUrl: 'subject-list.component.html',
  imports: [CommonModule, FormsModule], // ⬅️ include FormsModule
})
export class SubjectListComponent implements OnInit {
  semesterFilter: string = '';
  quarterFilter: string = '';

  history: any[] = [];
  groupedHistory: any[] = [];
  filteredHistory: any[] = []; // ⬅️ for search results
  homeroom_id: string;

  selectedGroup: any = null;
  selectedQuarter: any = null;

  showRequestModal = false;
  account = this.accountService.accountValue;
  loading = false;

  searchTerm: string = ''; // ⬅️ search term

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

    this.fetchHistory();
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredHistory = this.groupedHistory
      .map((group) => {
        // Filter quarters by selected quarter
        let quarters = group.quarters;
        if (this.quarterFilter) {
          quarters = quarters.filter((q) => q.quarter === this.quarterFilter);
        }

        // Only return group if it has matching quarters
        if (quarters.length === 0) return null;

        return {
          ...group,
          quarters,
        };
      })
      .filter((g) => g !== null) // remove empty groups
      .filter((g) => {
        // Filter by semester
        if (this.semesterFilter && g.semester !== this.semesterFilter)
          return false;

        // Search filter
        return (
          !term ||
          g.subject_name?.toLowerCase().includes(term) ||
          g.semester?.toLowerCase().includes(term) ||
          g.teacher_name?.toLowerCase().includes(term)
        );
      });
  }

  private fetchHistory() {
    this.loading = true;
    this.gradingService
      .getSubjectsLockingHistory(Number(this.homeroom_id))
      .pipe(first())
      .subscribe({
        next: (results) => {
          this.history = results;
          this.groupedHistory = this.groupBySubjectSemester(results);
          this.filteredHistory = this.groupedHistory; // ⬅️ initial
          this.loading = false;
        },
        error: (err) => {
          console.log('Error: ', err);
          this.loading = false;
        },
      });
  }

  private groupBySubjectSemester(records: any[]) {
    const map = new Map();

    for (const rec of records) {
      const key = `${rec.subject_name}-${rec.semester}`;
      if (!map.has(key)) {
        map.set(key, {
          subject_name: rec.subject_name,
          semester: rec.semester,
          teacher_name: rec.teacher_name,
          quarters: [],
        });
      }

      map.get(key).quarters.push({
        assignment_id: rec.assignment_id,
        quarter: rec.quarter,
        lock_status: rec.lock_status,
        reason_to_unlock: rec.reason_to_unlock,
        locked_batches: rec.locked_batches || [],
        expanded: false,
      });
    }

    return Array.from(map.values());
  }

  // 🔍 Search function
  onSearch() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredHistory = !term
      ? this.groupedHistory
      : this.groupedHistory.filter(
          (g) =>
            g.subject_name?.toLowerCase().includes(term) ||
            g.semester?.toLowerCase().includes(term) ||
            g.teacher_name?.toLowerCase().includes(term)
        );
  }

  openRequestModal(group: any, quarter: any) {
    this.selectedGroup = group;
    this.selectedQuarter = quarter;
    this.showRequestModal = true;
  }

  closeRequestModal() {
    this.showRequestModal = false;
    this.selectedGroup = null;
    this.selectedQuarter = null;
  }

  respondToRequest(status: 'UNLOCKED' | 'LOCKED') {
    if (!this.selectedQuarter) return;

    this.gradingService
      .updateSubjectStatus(this.selectedQuarter.assignment_id, {
        status,
        quarter: this.selectedQuarter.quarter,
      })
      .pipe(first())
      .subscribe({
        next: () => {
          this.selectedQuarter.lock_status = status;
          this.alertService.success('Status updated successfully!');
          this.closeRequestModal();
        },
        error: (err) => {
          console.error('Failed to update subject status:', err);
        },
      });
  }
}
