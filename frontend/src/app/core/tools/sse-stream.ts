/**
 * @fileoverview Utility for establishing Server-Sent Events (SSE) connections using RxJS Observables.
 */

import { Observable } from 'rxjs';

export interface SSEOptions {
  onOpen?: () => void;
  onError?: (error: Event) => void;
}

/**
 * Connects to a Server-Sent Events (SSE) endpoint and returns an Observable stream of messages.
 *
 * @template T - The type of data expected in the SSE messages.
 * @param {string} url - The URL of the SSE endpoint.
 * @param {SSEOptions} [options] - Optional callbacks for connection open and error events.
 * @returns {Observable<T>} An Observable that emits the parsed JSON data from the stream.
 */
export function connectSSE<T>(url: string, options?: SSEOptions): Observable<T> {
  return new Observable<T>((observer) => {
    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      console.log('[SSE] Connection opened');
      options?.onOpen?.();
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        observer.next(data);
      } catch (err) {
        console.error('[SSE] Parse Error:', err);
      }
    };

    eventSource.onerror = (error) => {
      console.error('[SSE] Error:', error, 'readyState:', eventSource.readyState);
      options?.onError?.(error);
      observer.error(error);
      eventSource.close();
    };

    return () => {
      console.log('[SSE] Cleanup - closing connection');
      eventSource.close();
    };
  });
}
