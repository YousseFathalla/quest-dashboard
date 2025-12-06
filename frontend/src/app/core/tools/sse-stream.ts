import { Observable } from 'rxjs';

export interface SSEOptions {
  onOpen?: () => void;
  onError?: (error: Event) => void;
}

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
