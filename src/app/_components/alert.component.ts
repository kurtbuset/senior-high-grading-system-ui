import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';

import { Alert, AlertType } from '@app/_models/alert';
import { AlertService } from '@app/_services/alert.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'alert',
  templateUrl: 'alert.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class AlertComponent implements OnInit, OnDestroy {
  @Input() id = 'default-alert';
  @Input() fade = true;

  alerts: Alert[] = [];
  private alertSubscription: Subscription;
  private routeSubscription: Subscription;

  constructor(private router: Router, private alertService: AlertService) {}

  ngOnInit() {
    // Listen for alert messages
    this.alertSubscription = this.alertService.onAlert(this.id).subscribe(alert => {
      if (!alert.message) {
        // Clear alerts that shouldn't persist after route change
        this.alerts = this.alerts.filter(x => x.keepAfterRouteChange);
        this.alerts.forEach(x => delete x.keepAfterRouteChange);
        return;
      }

      // Add alert to the array
      this.alerts.push(alert);

      // Auto-dismiss after 3 seconds
      if (alert.autoClose) {
        setTimeout(() => this.removeAlert(alert), 3000);
      }
    });

    // Clear alerts on route change
    this.routeSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.alertService.clear(this.id);
      }
    });
  }

  ngOnDestroy() {
    this.alertSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
  }

  removeAlert(alert: Alert) {
    if (!this.alerts.includes(alert)) return;

    if (this.fade) {
      alert.fade = true;
      setTimeout(() => {
        this.alerts = this.alerts.filter(x => x !== alert);
      }, 250);
    } else {
      this.alerts = this.alerts.filter(x => x !== alert);
    }
  }

  cssClasses(alert: Alert) {
    if (!alert) return '';

    const classes = ['alert', 'alert-dismissible'];

    const alertTypeClass = {
      [AlertType.Success]: 'alert-success',
      [AlertType.Error]: 'alert-danger',
      [AlertType.Info]: 'alert-info',
      [AlertType.Warning]: 'alert-warning'
    };

    classes.push(alertTypeClass[alert.type]);

    if (alert.fade) {
      classes.push('fade');
    }

    return classes.join(' ');
  }
}
