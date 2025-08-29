import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HomeroomService } from '@app/_services/homeroom.service';


@Component({
  selector: 'homeroom-information',
  templateUrl: 'homeroom-information.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class HomeroomInformationComponent{
  // auto assignment when someone is using .next()
  homeroom$ = this.homeroomService.homeroom;

  constructor(
    private homeroomService: HomeroomService,
  ) {}

}
