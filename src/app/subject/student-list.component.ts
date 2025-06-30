import { Component, OnInit } from "@angular/core";
import { AccountService } from "@app/_services/account.service";
import { ActivatedRoute } from "@angular/router";

@Component({ selector: 'students', standalone: true, templateUrl: 'student-list.component.html'})
export class StudentListComponent implements OnInit{
  account = this.accountService.accountValue

  id: string
  
  constructor(
    private accountService: AccountService,
    private route: ActivatedRoute
  ){ }

  
  ngOnInit(){
    this.id = this.route.snapshot.paramMap.get('id')
    console.log('Teacher ID:', this.account.id)
    console.log('teacher subject assignemnt id:', this.id)
  }
}