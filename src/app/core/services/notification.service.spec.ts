import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('showSuccess', () => {
    it('should emit success notification', (done) => {
      service.notification$.subscribe((notification) => {
        expect(notification?.type).toBe('success');
        expect(notification?.message).toBe('Test success');
        done();
      });

      service.showSuccess('Test success');
    });
  });

  describe('showError', () => {
    it('should emit error notification', (done) => {
      service.notification$.subscribe((notification) => {
        expect(notification?.type).toBe('error');
        expect(notification?.message).toBe('Test error');
        done();
      });

      service.showError('Test error');
    });
  });

  describe('showInfo', () => {
    it('should emit info notification', (done) => {
      service.notification$.subscribe((notification) => {
        expect(notification?.type).toBe('info');
        expect(notification?.message).toBe('Test info');
        done();
      });

      service.showInfo('Test info');
    });
  });

  // Note: NotificationService no tiene método clear() actualmente
  // Este test está preparado para cuando se agregue
});

