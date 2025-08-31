import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeroomService } from '@app/_services/homeroom.service';
import { first } from 'rxjs';
import { RouterModule } from '@angular/router';


@Component({
  standalone: true,
  templateUrl: 'homeroom-list.component.html',
  imports: [CommonModule, RouterModule],
})
export class HomeroomListComponent implements OnInit{
  homerooms: any[]
  loading: boolean = false;

  constructor(private homeroomService: HomeroomService){}

  

  ngOnInit(){
    this.loading = true;
    this.homeroomService
      .getHomerooms()
      .pipe(first())
      .subscribe({
        next: (homerooms) => {
          this.homerooms = homerooms
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading homerooms:', error);
        }
      })
  }
}
