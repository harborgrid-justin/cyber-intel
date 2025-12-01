// 🟣 AGENT-4: Real-time WebSocket Service

export interface WebSocketMessage {
  type: 'threat_created' | 'threat_updated' | 'case_updated' | 'alert' | 'notification';
  data: any;
  timestamp: string;
}

export class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor(private url: string = 'ws://localhost:3001') {}

  connect(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
          console.log('🟣 [WebSocket] Connected to backend');
          this.reconnectAttempts = 0;
          resolve(true);
        };

        this.socket.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (err) {
            console.error('🟣 [WebSocket] Error parsing message:', err);
          }
        };

        this.socket.onerror = (error) => {
          console.error('🟣 [WebSocket] Error:', error);
          resolve(false);
        };

        this.socket.onclose = () => {
          console.log('🟣 [WebSocket] Connection closed');
          this.attemptReconnect();
        };
      } catch (err) {
        console.error('🟣 [WebSocket] Failed to connect:', err);
        resolve(false);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🟣 [WebSocket] Reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), this.reconnectDelay);
    } else {
      console.error('🟣 [WebSocket] Max reconnection attempts reached');
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach(callback => callback(message.data));
    }

    // Global listeners
    const globalListeners = this.listeners.get('*');
    if (globalListeners) {
      globalListeners.forEach(callback => callback(message));
    }
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  send(type: string, data: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data, timestamp: new Date().toISOString() }));
    } else {
      console.warn('🟣 [WebSocket] Cannot send - not connected');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const wsService = new WebSocketService(
  import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
);
