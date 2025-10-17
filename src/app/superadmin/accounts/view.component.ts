import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '@app/_services/account.service';

@Component({
  standalone: true,
  templateUrl: 'view.component.html',
  imports: [CommonModule]
})
export class ViewComponent implements OnInit {
  account: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.accountService.getById(id).subscribe({
      next: (data) => {
        this.account = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading account:', err);
        this.loading = false;
      }
    });
  }
}
