import { Observable } from 'rxjs';


export interface Logger {
  info(message: string): void;
  error(message: string, context?: unknown): void;
}

export interface SSEOptions {
  onOpen?: () => void;
  onError?: (error: Event) => void;
  logger?: Logger;
}

/**
 * connects to an SSE endpoint and gives you a stream of messages.
 * handles the parsing and error logging for you.
 */
export function connectSSE<T>(url: string, options?: SSEOptions): Observable<T> {
  return new Observable<T>((observer) => {
    const eventSource = new EventSource(url);
    const logger = options?.logger;

    eventSource.onopen = () => {
      logger?.info('[SSE] Connection opened');
      options?.onOpen?.();
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        observer.next(data);
      } catch (err) {
        logger?.error('[SSE] Parse Error', err);
      }
    };

    eventSource.onerror = (error) => {
      logger?.error('[SSE] Error', { error, readyState: eventSource.readyState });
      options?.onError?.(error);
      observer.error(error);
      eventSource.close();
    };

    return () => {
      logger?.info('[SSE] Cleanup - closing connection');
      eventSource.close();
    };
  });
}
