import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Role } from './_models/role';
import { Account } from './_models/account';

import { AccountService } from './_services/account.service';
import { SubjectService } from './_services/subject.service';
import { CommonModule } from '@angular/common';
import { AlertComponent } from './_components/alert.component';
import { NotificationSocketService } from './_services/notification-socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AlertComponent, RouterModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  Role = Role;
  account: Account;
  showLogoutModal = false;
  showNotifications = false;

  // Sample notifications (replace with API call later)
  notifications = [];

  constructor(
    private accountService: AccountService,
    private subjectService: SubjectService,
    private router: Router,
    private notifSocket: NotificationSocketService
  ) {
    accountService.account.subscribe((x) => {
      this.account = x;

      if (this.account?.id) {
        this.loadNotifications();
      }
    });
  }

  ngOnInit() {
    this.accountService.account.subscribe((account) => {
      if (account?.id) {
        this.notifSocket.join(account.id);
        this.notifSocket.onNewNotification((notif) => {
          console.log('📩 Real-time notification received:', notif);
          this.notifications.unshift(notif);
        });
      }
    });

    // 👇 listen for clicks outside to close notifications
    document.addEventListener('click', (event) => {
      const dropdown = document.querySelector('.dropdown-menu');
      const bell = document.getElementById('notificationDropdown');
      if (
        this.showNotifications &&
        dropdown &&
        !dropdown.contains(event.target as Node) &&
        !bell.contains(event.target as Node)
      ) {
        this.showNotifications = false;
      }
    });
  }

  toggleNotifications(event: MouseEvent) {
    event.stopPropagation(); // prevent immediate close
    this.showNotifications = !this.showNotifications;
  }

  loadNotifications() {
    this.accountService.getNotifications(this.account.id).subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        // console.log('fetched notifications: ', notifications);
      },
      error: (err) => console.error('Failed to load notifications: ', err),
    });
  }

  openLogoutModal() {
    this.showLogoutModal = true;
  }

  closeLogoutModal() {
    this.showLogoutModal = false;
  }

  logout() {
    this.showLogoutModal = false;
    this.accountService.logout();
    this.subjectService.eraseSubjects();
  }

  markAsReadAndGo(notif: any) {
    console.log('clicked!');
    if (notif.type === 'LOCKED' && notif.is_read === false) {
      this.accountService.updateIsRead(notif.id).subscribe({
        next: (_) => {
          this.loadNotifications();
          this.router.navigate(['/egrade']);
        },
        error: (err) => console.error('failed to update notifcation: ', err),
      });
    } else {
      console.log('failed');
    }
  }
}
