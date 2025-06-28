import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Alert, AlertType } from '@app/_models/alert';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private subject = new Subject<Alert>();
  private defaultId = 'default-alert';

  // enable subscribing to alerts observable
  onAlert(id = this.defaultId): Observable<Alert> {
    return this.subject.asObservable().pipe(filter((x) => x && x.id === id));
  }

  // convenience methods
  success(message: string, options?: any) {
    const extractedMessage = this.extractMessage(message);
    this.alert(new Alert({ ...options, type: AlertType.Success, message: extractedMessage }));
  }

  error(message: any, options?: any) {
    const extractedMessage = this.extractMessage(message);
    this.alert(new Alert({ ...options, type: AlertType.Error, message: extractedMessage }));
  }

  info(message: string, options?: any) {
    const extractedMessage = this.extractMessage(message);
    this.alert(new Alert({ ...options, type: AlertType.Info, message: extractedMessage }));
  }

  warn(message: string, options?: any) {
    const extractedMessage = this.extractMessage(message);
    this.alert(new Alert({ ...options, type: AlertType.Warning, message: extractedMessage }));
  }

  // core alert method
  alert(alert: Alert) {
    alert.id = alert.id || this.defaultId;
    alert.autoClose = alert.autoClose === undefined ? true : alert.autoClose;
    this.subject.next(alert);
  }

  // clear alerts
  clear(id = this.defaultId) {
    this.subject.next(new Alert({ id }));
  }

  private extractMessage(error: any): string {
    if (!error) return 'An unknown error occurred';

    // If it's already a string, just return it
    if (typeof error === 'string') return error;

    // If it's an object with an error property
    if (error.error) {
      if (typeof error.error === 'string') return error.error;
      if (typeof error.error.message === 'string') return error.error.message;
    }

    // If it has a message property
    if (typeof error.message === 'string') return error.message;

    // fallback to JSON string of the error object (for debugging)
    try {
      return JSON.stringify(error);
    } catch {
      return 'An unknown error occurred';
    }
  }
}
