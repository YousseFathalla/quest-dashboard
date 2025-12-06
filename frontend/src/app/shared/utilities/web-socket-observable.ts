/**
 * @fileoverview Utility for creating an RxJS Observable from a WebSocket connection.
 */

import { Observable } from "rxjs";

/**
 * Creates an Observable that connects to a WebSocket URL and emits messages.
 * Handles connection, message parsing, error handling, and cleanup.
 *
 * @template T - The expected type of the data received from the WebSocket.
 * @param {string} url - The WebSocket URL to connect to.
 * @returns {Observable<T>} An Observable stream of parsed messages.
 */
export function webSocketObservable<T>(url: string): Observable<T> {
  return new Observable<T>((subscriber) => {
    const socket = new WebSocket(url);

    socket.onmessage = (event) => {
      try {
        const data: T = JSON.parse(event.data);
        subscriber.next(data);
      } catch (error) {
        subscriber.error(error);
      }
    };

    socket.onerror = (error) => {
      subscriber.error(error);
    };

    socket.onclose = () => {
      subscriber.complete();
    };

    // Cleanup function to close the WebSocket connection
    return () => {
      socket.close();
    };
  });
}
