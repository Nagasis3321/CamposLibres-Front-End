import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Define la estructura de un mensaje de notificación.
export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Un Subject es como un emisor de eventos. Los componentes de UI se suscribirán a él.
  private notificationSubject = new Subject<Notification>();
  public notification$ = this.notificationSubject.asObservable();

  /**
   * Muestra una notificación de éxito.
   * @param message El mensaje a mostrar.
   */
  showSuccess(message: string) {
    this.notificationSubject.next({ message, type: 'success' });
  }

  /**
   * Muestra una notificación de error.
   * @param message El mensaje a mostrar.
   */
  showError(message: string) {
    this.notificationSubject.next({ message, type: 'error' });
  }

  /**
   * Muestra una notificación de información.
   * @param message El mensaje a mostrar.
   */
  showInfo(message: string) {
    this.notificationSubject.next({ message, type: 'info' });
  }
}
