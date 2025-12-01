// 🟢 AGENT-2: React Hook for Backend Connection Management

import { useState, useEffect } from 'react';
import { threatData } from './dataLayer';
import { wsService } from './websocketService';

export interface ConnectionStatus {
  http: boolean;
  websocket: boolean;
  adapter: string;
  error?: string;
}

export function useBackendConnection(autoConnect = true) {
  const [status, setStatus] = useState<ConnectionStatus>({
    http: false,
    websocket: false,
    adapter: 'mock',
  });

  const [isLoading, setIsLoading] = useState(false);

  const connect = async () => {
    setIsLoading(true);
    
    try {
      // Connect HTTP adapter
      const httpConnected = await threatData.useHttpAdapter({
        host: import.meta.env.VITE_API_URL?.replace(/:\d+$/, '') || 'http://localhost',
        port: parseInt(import.meta.env.VITE_API_URL?.match(/:(\d+)$/)?.[1] || '3001'),
      });

      if (httpConnected) {
        // Fetch initial data
        await Promise.all([
          threatData.threatStore.fetch(),
          threatData.caseStore.fetch(),
          threatData.actorStore.fetch(),
          threatData.campaignStore.fetch(),
          threatData.vulnStore.fetch(),
          threatData.nodeStore.fetch(),
          threatData.userStore.fetch(),
          threatData.reportStore.fetch(),
        ]);

        // Connect WebSocket
        const wsConnected = await wsService.connect();

        if (wsConnected) {
          // Set up real-time listeners
          wsService.on('threat_created', (threat) => {
            threatData.threatStore.add(threat);
          });

          wsService.on('threat_updated', (threat) => {
            threatData.threatStore.update(threat);
          });

          wsService.on('case_updated', (caseData) => {
            threatData.caseStore.update(caseData);
          });
        }

        setStatus({
          http: true,
          websocket: wsConnected,
          adapter: 'http',
        });
      } else {
        throw new Error('HTTP connection failed');
      }
    } catch (error) {
      console.error('Connection error:', error);
      threatData.useMockAdapter();
      setStatus({
        http: false,
        websocket: false,
        adapter: 'mock',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    wsService.disconnect();
    threatData.useMockAdapter();
    setStatus({
      http: false,
      websocket: false,
      adapter: 'mock',
    });
  };

  const refresh = async () => {
    if (status.http) {
      setIsLoading(true);
      try {
        await Promise.all([
          threatData.threatStore.fetch(),
          threatData.caseStore.fetch(),
          threatData.actorStore.fetch(),
          threatData.campaignStore.fetch(),
        ]);
      } catch (error) {
        console.error('Refresh error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (autoConnect && import.meta.env.VITE_ENABLE_MOCK !== 'true') {
      connect();
    }

    return () => {
      if (wsService.isConnected()) {
        wsService.disconnect();
      }
    };
  }, [autoConnect]);

  return {
    status,
    isLoading,
    connect,
    disconnect,
    refresh,
  };
}
