import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Notification, NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private subscription!: Subscription;

  notifications: Notification[] = [];

  ngOnInit(): void {
    this.subscription = this.notificationService.notification$.subscribe(notification => {
      this.notifications.push(notification);
      // La notificación desaparecerá después de 5 segundos.
      setTimeout(() => this.close(notification), 5000);
    });
  }

  close(notification: Notification): void {
    this.notifications = this.notifications.filter(n => n !== notification);
  }

  // Devuelve las clases de Tailwind según el tipo de notificación.
  getNotificationClass(notification: Notification): string {
    switch (notification.type) {
      case 'success': return 'bg-success text-white';
      case 'error': return 'bg-danger text-white';
      case 'info': return 'bg-info text-white';
      default: return 'bg-neutral-dark text-white';
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
