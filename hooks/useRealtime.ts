
import { useEffect, useState, useRef, useCallback } from 'react';
import { RealtimeEvent } from '../services/store/types';

export interface UseRealtimeOptions {
  url: string;
  reconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (event: RealtimeEvent) => void;
}

export interface UseRealtimeResult {
  connected: boolean;
  connecting: boolean;
  error: Event | null;
  lastMessage: RealtimeEvent | null;
  send: (data: any) => void;
  connect: () => void;
  disconnect: () => void;
}

/**
 * WebSocket/SSE integration hook for real-time updates
 */
export function useRealtime(options: UseRealtimeOptions): UseRealtimeResult {
  const {
    url,
    reconnect = true,
    reconnectDelay = 3000,
    maxReconnectAttempts = 5,
    onConnect,
    onDisconnect,
    onError,
    onMessage
  } = options;

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<Event | null>(null);
  const [lastMessage, setLastMessage] = useState<RealtimeEvent | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<any>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    setConnecting(true);
    setError(null);

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        if (!mountedRef.current) return;

        setConnected(true);
        setConnecting(false);
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;

        setConnected(false);
        setConnecting(false);
        onDisconnect?.();

        // Attempt reconnection
        if (
          reconnect &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay * reconnectAttemptsRef.current);
        }
      };

      ws.onerror = (event) => {
        if (!mountedRef.current) return;

        setError(event);
        setConnecting(false);
        onError?.(event);
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;

        try {
          const message: RealtimeEvent = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setConnecting(false);
    }
  }, [url, reconnect, reconnectDelay, maxReconnectAttempts, onConnect, onDisconnect, onError, onMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnected(false);
    setConnecting(false);
  }, []);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connected,
    connecting,
    error,
    lastMessage,
    send,
    connect,
    disconnect
  };
}

/**
 * Server-Sent Events (SSE) hook
 */
export function useSSE(options: Omit<UseRealtimeOptions, 'url'> & { url: string }): Omit<UseRealtimeResult, 'send'> {
  const { url, onConnect, onDisconnect, onError, onMessage } = options;

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<Event | null>(null);
  const [lastMessage, setLastMessage] = useState<RealtimeEvent | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      return; // Already connected
    }

    setConnecting(true);
    setError(null);

    try {
      const eventSource = new EventSource(url);

      eventSource.onopen = () => {
        if (!mountedRef.current) return;
        setConnected(true);
        setConnecting(false);
        onConnect?.();
      };

      eventSource.onerror = (event) => {
        if (!mountedRef.current) return;
        setError(event);
        setConnected(false);
        setConnecting(false);
        onError?.(event);
        onDisconnect?.();
      };

      eventSource.onmessage = (event) => {
        if (!mountedRef.current) return;

        try {
          const message: RealtimeEvent = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
        } catch (err) {
          console.error('Failed to parse SSE message:', err);
        }
      };

      eventSourceRef.current = eventSource;
    } catch (err) {
      console.error('Failed to create EventSource:', err);
      setConnecting(false);
    }
  }, [url, onConnect, onDisconnect, onError, onMessage]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setConnected(false);
    setConnecting(false);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connected,
    connecting,
    error,
    lastMessage,
    connect,
    disconnect
  };
}
