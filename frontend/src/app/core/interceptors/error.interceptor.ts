/**
 * @fileoverview HTTP Interceptor for handling errors and connection status.
 * Intercepts all HTTP requests to provide global error handling and network status notifications.
 */

import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ConnectionService } from '../services/connection.service';

/**
 * Functional HTTP interceptor that catches HTTP errors.
 * Notifies the ConnectionService about network issues or server errors.
 *
 * @param {HttpRequest<unknown>} req - The outgoing HTTP request.
 * @param {HttpHandlerFn} next - The next handler in the chain.
 * @returns {Observable<HttpEvent<unknown>>} The observable of the HTTP event stream.
 */
export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const connectionService = inject(ConnectionService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Network error or offline
      if (!navigator.onLine || error.status === 0) {
        connectionService.showDisconnected();
      } else if (error.status >= 500) {
        // Server error - show user-friendly message
        connectionService.showError(
          'Server error occurred. Please try again later.'
        );
      }

      return throwError(() => error);
    })
  );
};
