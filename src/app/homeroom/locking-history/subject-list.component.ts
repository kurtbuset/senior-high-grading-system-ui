import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GradingService } from '@app/_services/grading.service';
import { first } from 'rxjs';

@Component({
  standalone: true,
  templateUrl: 'subject-list.component.html',
  imports: [CommonModule],
})
export class SubjectListComponent implements OnInit {
  history: any[] = [];
  homeroom_id: string;

  constructor(
    private route: ActivatedRoute,
    private gradingService: GradingService
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
          console.log(results)
          this.history = results;
        },
        error: err => {
          console.log('Error: ', err)
        }
      });
  }
}

