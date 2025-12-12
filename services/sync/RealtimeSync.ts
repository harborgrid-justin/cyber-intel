
import { RealtimeEvent } from '../store/types';
import { queryClient } from '../query';

export interface RealtimeSyncOptions {
  url: string;
  reconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export interface SyncHandler<T = any> {
  entity: string;
  onSync: (event: RealtimeEvent<T>) => void;
}

/**
 * Real-time sync manager for WebSocket/SSE connections
 */
export class RealtimeSync {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<SyncHandler['onSync']>> = new Map();
  private reconnectAttempts = 0;
  private reconnectTimer: any = null;
  private connected = false;
  private connecting = false;

  constructor(private options: RealtimeSyncOptions) {}

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.connected || this.connecting) return;

    this.connecting = true;

    try {
      this.ws = new WebSocket(this.options.url);

      this.ws.onopen = () => {
        this.connected = true;
        this.connecting = false;
        this.reconnectAttempts = 0;
        this.options.onConnect?.();
        console.log('[RealtimeSync] Connected');
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.connecting = false;
        this.options.onDisconnect?.();
        console.log('[RealtimeSync] Disconnected');

        // Attempt reconnection
        if (
          this.options.reconnect &&
          this.reconnectAttempts < (this.options.maxReconnectAttempts || 5)
        ) {
          this.reconnectAttempts++;
          const delay = (this.options.reconnectDelay || 3000) * this.reconnectAttempts;

          console.log(`[RealtimeSync] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`);

          this.reconnectTimer = setTimeout(() => {
            this.connect();
          }, delay);
        }
      };

      this.ws.onerror = (event) => {
        console.error('[RealtimeSync] Error:', event);
        this.options.onError?.(event);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: RealtimeEvent = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('[RealtimeSync] Failed to parse message:', error);
        }
      };
    } catch (error) {
      console.error('[RealtimeSync] Failed to create WebSocket:', error);
      this.connecting = false;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.connected = false;
    this.connecting = false;
  }

  /**
   * Send message to server
   */
  send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('[RealtimeSync] WebSocket is not connected');
    }
  }

  /**
   * Register a sync handler for an entity
   */
  registerHandler(entity: string, handler: SyncHandler['onSync']): () => void {
    if (!this.handlers.has(entity)) {
      this.handlers.set(entity, new Set());
    }

    this.handlers.get(entity)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(entity);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.handlers.delete(entity);
        }
      }
    };
  }

  /**
   * Handle incoming message
   */
  private handleMessage(event: RealtimeEvent): void {
    console.log('[RealtimeSync] Received:', event);

    const handlers = this.handlers.get(event.entity);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('[RealtimeSync] Handler error:', error);
        }
      });
    }

    // Automatically invalidate relevant queries
    this.invalidateQueries(event);
  }

  /**
   * Invalidate queries based on realtime event
   */
  private invalidateQueries(event: RealtimeEvent): void {
    switch (event.type) {
      case 'create':
      case 'update':
      case 'delete':
        // Invalidate list queries for the entity
        queryClient.invalidateQueries([event.entity]);

        // Invalidate specific item query if available
        if (event.data?.id) {
          queryClient.invalidateQueries([event.entity, event.data.id]);
        }
        break;

      case 'sync':
        // Full sync - invalidate all queries for the entity
        queryClient.invalidateQueries([event.entity]);
        break;
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get connecting status
   */
  isConnecting(): boolean {
    return this.connecting;
  }
}

/**
 * Optimistic update helper
 */
export class OptimisticUpdateManager<T extends { id: string }> {
  private updates: Map<string, T> = new Map();
  private rollbacks: Map<string, T | null> = new Map();

  /**
   * Apply optimistic update
   */
  apply(entity: string, id: string, data: T): void {
    // Store original data for rollback
    const original = queryClient.getQueryData<T>([entity, id]);
    this.rollbacks.set(id, original || null);

    // Apply optimistic update
    this.updates.set(id, data);
    queryClient.setQueryData([entity, id], data);

    // Update list query
    const list = queryClient.getQueryData<T[]>([entity]);
    if (list) {
      const updated = list.map(item => item.id === id ? data : item);
      queryClient.setQueryData([entity], updated);
    }
  }

  /**
   * Confirm optimistic update (remove from pending)
   */
  confirm(id: string): void {
    this.updates.delete(id);
    this.rollbacks.delete(id);
  }

  /**
   * Rollback optimistic update
   */
  rollback(entity: string, id: string): void {
    const original = this.rollbacks.get(id);

    if (original !== undefined) {
      queryClient.setQueryData([entity, id], original);

      // Update list query
      const list = queryClient.getQueryData<T[]>([entity]);
      if (list && original) {
        const updated = list.map(item => item.id === id ? original : item);
        queryClient.setQueryData([entity], updated);
      } else if (list && !original) {
        // Remove from list if original was null
        const updated = list.filter(item => item.id !== id);
        queryClient.setQueryData([entity], updated);
      }
    }

    this.updates.delete(id);
    this.rollbacks.delete(id);
  }

  /**
   * Check if an update is pending
   */
  isPending(id: string): boolean {
    return this.updates.has(id);
  }

  /**
   * Get all pending updates
   */
  getPending(): T[] {
    return Array.from(this.updates.values());
  }

  /**
   * Clear all pending updates
   */
  clear(): void {
    this.updates.clear();
    this.rollbacks.clear();
  }
}

/**
 * Conflict resolution strategies
 */
export enum ConflictResolution {
  CLIENT_WINS = 'client_wins',
  SERVER_WINS = 'server_wins',
  LAST_WRITE_WINS = 'last_write_wins',
  MANUAL = 'manual'
}

/**
 * Conflict resolver
 */
export class ConflictResolver<T extends { id: string; updatedAt?: string | number }> {
  resolve(
    client: T,
    server: T,
    strategy: ConflictResolution = ConflictResolution.SERVER_WINS
  ): T {
    switch (strategy) {
      case ConflictResolution.CLIENT_WINS:
        return client;

      case ConflictResolution.SERVER_WINS:
        return server;

      case ConflictResolution.LAST_WRITE_WINS:
        if (!client.updatedAt || !server.updatedAt) {
          return server; // Default to server if no timestamps
        }
        const clientTime = typeof client.updatedAt === 'string'
          ? new Date(client.updatedAt).getTime()
          : client.updatedAt;
        const serverTime = typeof server.updatedAt === 'string'
          ? new Date(server.updatedAt).getTime()
          : server.updatedAt;
        return clientTime > serverTime ? client : server;

      case ConflictResolution.MANUAL:
        // Return both for manual resolution
        return { ...server, _conflict: client } as any;

      default:
        return server;
    }
  }
}
