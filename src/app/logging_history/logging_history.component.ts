import { Component, OnInit } from "@angular/core";
import { AccountService } from "../_services/account.service";
import { first } from "rxjs";
import { CommonModule } from "@angular/common";
@Component({
  standalone: true,
  templateUrl: 'logging_history.component.html',
  imports: [CommonModule],
})
export class LoggingHistoryComponent implements OnInit{
  histories: any[] = [];


  constructor(private accountService: AccountService){}


  ngOnInit(): void {
    this.accountService
      .loggingHistory()
      .pipe(first())
      .subscribe({
        next: (histories) => {
          this.histories = histories;
        }
      })
  }
} 