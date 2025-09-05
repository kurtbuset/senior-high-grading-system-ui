import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeroomService } from '@app/_services/homeroom.service';
import { first } from 'rxjs';
import { RouterModule } from '@angular/router';
import { AccountService } from "@app/_services/account.service";

@Component({
  standalone: true,
  templateUrl: 'homeroom-list.component.html',
  imports: [CommonModule, RouterModule],
})
export class HomeroomListComponent implements OnInit {
  homerooms: any[];
  loading: boolean = false;
  account = this.accountService.accountValue;

  constructor(
    private homeroomService: HomeroomService,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    console.log(this.account.role)
    console.log(this.account.id)

    this.loading = true;
    this.homeroomService
      .getHomerooms(this.account.role, this.account.id)
      .pipe(first())
      .subscribe({
        next: (homerooms) => {
          console.log(homerooms)
          this.homerooms = homerooms;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading homerooms:', error);
        },
      });
  }
}
