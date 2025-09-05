import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule  } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SubnavAdminComponent } from './subnav.component';
import { HomeroomService } from '@app/_services/homeroom.service';
import { HomeroomInformationComponent } from '../homeroom-information.component';

@Component({
  selector: 'subject-layout',
  standalone: true,
  templateUrl: 'layout.component.html',
  imports: [RouterModule, CommonModule, SubnavAdminComponent, HomeroomInformationComponent],
})
export class LayoutComponent implements OnInit{
  homeroom_id: string

  constructor(private route: ActivatedRoute, private homeroomService: HomeroomService){}

  ngOnInit(){
    this.route.parent?.paramMap.subscribe((params) => {
      this.homeroom_id = params.get('id')!;
    }); 

    this.homeroomService
      .getOneHomeroom(Number(this.homeroom_id))
      .subscribe((homeroom) => {
        this.homeroomService.homeroomSubject.next(homeroom)
      })
  }
}
