
import { TestBed } from '@angular/core/testing';
import { ConnectionService } from './connection.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RetrySnackbar } from '@shared/components/retry-snackbar/retry-snackbar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { vi } from 'vitest';

describe('ConnectionService', () => {
  let service: ConnectionService;
  let snackBarSpy: any;
  let snackBarRefSpy: any;

  beforeEach(() => {
    snackBarRefSpy = {
      dismiss: vi.fn()
    };

    snackBarSpy = {
        openFromComponent: vi.fn().mockReturnValue(snackBarRefSpy),
        open: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        ConnectionService,
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    });
    service = TestBed.inject(ConnectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show disconnected snackbar', () => {
    service.showDisconnected();
    expect(snackBarSpy.openFromComponent).toHaveBeenCalledWith(RetrySnackbar, expect.objectContaining({
      data: expect.objectContaining({ message: 'Stream disconnected. Reconnecting...' })
    }));
  });

  it('should show connected snackbar only if previously disconnected', () => {
    // Initial state: connected, shouldn't show anything
    service.showConnected();
    expect(snackBarSpy.openFromComponent).not.toHaveBeenCalled();

    // Disconnect first
    service.showDisconnected();
    snackBarSpy.openFromComponent.mockClear();

    // Reconnect
    service.showConnected();
    expect(snackBarSpy.openFromComponent).toHaveBeenCalledWith(RetrySnackbar, expect.objectContaining({
      data: expect.objectContaining({ message: 'Stream connected!' })
    }));
  });

  it('should show error snackbar', () => {
    service.showError('Test error');
    expect(snackBarSpy.open).toHaveBeenCalledWith('Test error', 'Dismiss', expect.any(Object));
  });
});
