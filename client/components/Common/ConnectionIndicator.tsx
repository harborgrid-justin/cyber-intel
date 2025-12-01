// 🔵 AGENT-1: Connection Status Component

import React from 'react';
import { useBackendConnection } from '../../services-frontend/useBackendConnection';

export const ConnectionIndicator: React.FC = () => {
  const { status, isLoading, refresh } = useBackendConnection(false);

  const getStatusColor = () => {
    if (status.http && status.websocket) return '#22c55e';
    if (status.http) return '#eab308';
    return '#ef4444';
  };

  const getStatusText = () => {
    if (status.http && status.websocket) return 'Connected (Live)';
    if (status.http) return 'Connected (HTTP)';
    return 'Offline (Mock)';
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '4px 12px',
      background: 'rgba(0,0,0,0.2)',
      borderRadius: '16px',
      fontSize: '12px',
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: getStatusColor(),
        boxShadow: `0 0 8px ${getStatusColor()}`,
      }} />
      <span>{getStatusText()}</span>
      {status.http && (
        <button
          onClick={refresh}
          disabled={isLoading}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            borderRadius: '4px',
            padding: '2px 8px',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          {isLoading ? '...' : '↻'}
        </button>
      )}
    </div>
  );
};
