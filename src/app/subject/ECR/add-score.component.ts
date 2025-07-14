import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({ templateUrl: 'add-score.component.html', standalone: true})
export class AddScoreComponent implements OnInit{
   id: string;
  quarter: string;
  type: string;

  constructor(private route: ActivatedRoute){
  }

  ngOnInit(): void {
      this.route.paramMap.subscribe(params => {
      this.id = params.get('id')!;
      this.quarter = params.get('quarter')!;
      this.type = params.get('type')!;

      console.log('Quiz ID:', this.id);
      console.log('Quarter:', this.quarter);
      console.log('Type:', this.type);
    });
  }
  
}