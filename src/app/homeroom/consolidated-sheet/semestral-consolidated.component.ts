import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HomeroomService } from '@app/_services/homeroom.service';
import { first } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  templateUrl: 'semestral-consolidated.component.html',
  styleUrls: ['semestral-consolidated.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SemestralConsolidatedComponent implements OnInit {
  semester: string;
  loading: boolean = false;
  homeroomId: string;
  sheet: any;

  constructor(
    private route: ActivatedRoute,
    private homeroomService: HomeroomService
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
        console.log('semester: ', this.semester);
    });
  }
}
