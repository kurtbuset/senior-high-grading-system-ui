import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationSocketService {
  private socket = io(environment.apiUrl, { withCredentials: true });

  join(userId: string) {
    this.socket.emit('join', userId);
  }

  onNewNotification(callback: (notif: any) => void) {
    this.socket.on('newNotification', callback);
  }

  onGradeUpdated(callback: (update: any) => void) {
    this.socket.on('gradeUpdated', callback);
  }
}
