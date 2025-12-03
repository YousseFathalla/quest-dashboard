import { Injectable } from '@angular/core';
import { Observable, Subject, timer, Subscription } from 'rxjs';
import { WebSocketMessage } from '../models/dashboard.types';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectSubscription: Subscription | null = null;
  private isManualDisconnect = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private readonly baseReconnectDelay = 1000; // 1 second
  private readonly maxReconnectDelay = 30000; // 30 seconds
  private readonly wsUrl = environment.wsUrl;
  readonly messageSubject = new Subject<WebSocketMessage>();

  // Connects to the WebSocket server and returns an Observable of messages.
  // If already connected, returns the existing connection Observable.
  // Automatically reconnects on connection loss (unless manually disconnected).
  connect(): Observable<WebSocketMessage> {
    // Return existing connection if already connected or connecting
    if (
      this.socket?.readyState === WebSocket.OPEN ||
      this.socket?.readyState === WebSocket.CONNECTING
    ) {
      return this.messageSubject.asObservable();
    }

    // Close existing connection if in closing/closed state
    if (this.socket) {
      this.disconnect();
    }

    this.isManualDisconnect = false;
    this.reconnectAttempts = 0;
    this.establishConnection();

    return this.messageSubject.asObservable();
  }

  // Establishes a new WebSocket connection
  private establishConnection(): void {
    try {
      this.socket = new WebSocket(this.wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket Connected');
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage;
          this.messageSubject.next(data);
        } catch (err) {
          console.error('Error parsing WebSocket message', err);
          this.messageSubject.error(err);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
        // Don't emit error immediately - let onclose handle reconnection
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket Closed', event.code, event.reason);
        this.socket = null;

        // Attempt reconnection if not manually disconnected
        if (!this.isManualDisconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
          this.messageSubject.error(
            new Error('WebSocket connection failed after maximum retry attempts')
          );
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection', error);
      this.messageSubject.error(error);
    }
  }

  // Schedules a reconnection attempt with exponential backoff
  private scheduleReconnect(): void {
    // Clean up any existing reconnect subscription
    if (this.reconnectSubscription) {
      this.reconnectSubscription.unsubscribe();
      this.reconnectSubscription = null;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);

    this.reconnectSubscription = timer(delay).subscribe(() => {
      if (!this.isManualDisconnect && !this.socket) {
        console.log(`Reconnection attempt ${this.reconnectAttempts}`);
        this.reconnectSubscription = null;
        this.establishConnection();
      }
    });
  }

  // Disconnects from the WebSocket server
  disconnect(): void {
    this.isManualDisconnect = true;

    // Clean up reconnect subscription
    if (this.reconnectSubscription) {
      this.reconnectSubscription.unsubscribe();
      this.reconnectSubscription = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  // Checks if the WebSocket is currently connected
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  // Gets the current connection state

  getConnectionState(): 'connecting' | 'open' | 'closing' | 'closed' {
    if (!this.socket) return 'closed';

    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'open';
      case WebSocket.CLOSING:
        return 'closing';
      default:
        return 'closed';
    }
  }
}
