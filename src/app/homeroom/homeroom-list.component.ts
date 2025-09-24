import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeroomService } from '@app/_services/homeroom.service';
import { first } from 'rxjs';
import { RouterModule } from '@angular/router';
import { AccountService } from "@app/_services/account.service";
import { FormsModule } from '@angular/forms'; // ⬅️ add this

@Component({
  standalone: true,
  templateUrl: 'homeroom-list.component.html',
  imports: [CommonModule, RouterModule, FormsModule], // ⬅️ include FormsModule
})
export class HomeroomListComponent implements OnInit {
  homerooms: any[] = [];
  filteredHomerooms: any[] = [];
  loading: boolean = false;
  account = this.accountService.accountValue;
  searchTerm: string = '';

  constructor(
    private homeroomService: HomeroomService,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.homeroomService
      .getHomerooms(this.account.role, this.account.id)
      .pipe(first())
      .subscribe({
        next: (homerooms) => {
          this.homerooms = homerooms;
          this.filteredHomerooms = homerooms; // initially show all
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading homerooms:', error);
          this.loading = false;
        },
      });
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredHomerooms = !term
      ? this.homerooms
      : this.homerooms.filter(h =>
          (h.grade_level?.toString().toLowerCase().includes(term)) ||
          (h.section?.toLowerCase().includes(term)) ||
          (h.strand?.toLowerCase().includes(term)) ||
          (h.school_year?.toString().toLowerCase().includes(term))
        );
  }
}
