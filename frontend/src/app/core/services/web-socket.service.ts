import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardEvent } from '../models/dashboard.types';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket!: WebSocket;
  private readonly URL = 'ws://localhost:3000';

  connect(): Observable<DashboardEvent> {
    return new Observable((observer) => {
      // 1. Open the connection
      this.socket = new WebSocket(this.URL);

      // 2. Listen for connection success
      this.socket.onopen = () => {
        console.log('✅ WebSocket Connected');
      };

      // 3. Listen for incoming messages
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as DashboardEvent;
          observer.next(data);
        } catch (err) {
          console.error('Error parsing message', err);
        }
      };

      // 4. Handle errors
      this.socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
        observer.error(error);
      };

      // 5. Cleanup when the component is destroyed
      return () => {
        if (this.socket.readyState === WebSocket.OPEN) {
          this.socket.close();
        }
      };
    });
  }
}
