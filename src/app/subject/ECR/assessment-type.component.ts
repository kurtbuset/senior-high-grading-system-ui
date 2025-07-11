import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { GradingService } from "@app/_services/grading.service";

@Component({ templateUrl: 'assessment-type.component.html', standalone: true, imports: [CommonModule] })
export class AssessmentTypeComponent implements OnInit{
  teacher_subject_id: string
  quarter: string
  type: string

  quizzes: any
  constructor(
    private route: ActivatedRoute,
    private gradingService: GradingService
  ){
     this.route.parent?.paramMap.subscribe((params) => {
      this.teacher_subject_id = params.get('id')!;
    })
  }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.quarter = data['quarter'];
      this.type = data['type']
    });

   ;

    const values = {
      quarter: this.quarter,
      type: this.type
    }

    console.log('test')

    // console.log(values) 
    this.gradingService
      .getHighestPossibleScore(this.teacher_subject_id, values).subscribe({
        next: (quizzes) => {
          this.quizzes = quizzes
        },
        error: error => {
          console.log(error)
        }
      })
  }
}