
import React, { useState, useMemo } from 'react';
import { Case } from '../../../types';
import { Card, Badge, Grid, CardHeader } from '../../Shared/UI';
import { Icons } from '../../Shared/Icons';
import { threatData } from '../../../services/dataLayer';

interface NetworkConnection {
  id: string;
  source: string;
  destination: string;
  port: string;
  protocol: string;
  status: 'ALLOWED' | 'BLOCKED' | 'SUSPICIOUS';
  timestamp: string;
  bytesTransferred: number;
  caseId?: string;
}

interface NetworkNode {
  id: string;
  ip: string;
  hostname: string;
  type: 'INTERNAL' | 'EXTERNAL' | 'DMZ';
  reputation: 'TRUSTED' | 'NEUTRAL' | 'MALICIOUS';
  country?: string;
  connections: number;
}

interface IncidentNetworkProps {
  cases: Case[];
}

export const IncidentNetwork: React.FC<IncidentNetworkProps> = React.memo(({ cases }) => {
  const [selectedConnection, setSelectedConnection] = useState<NetworkConnection | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ALLOWED' | 'BLOCKED' | 'SUSPICIOUS'>('ALL');
  const [viewMode, setViewMode] = useState<'connections' | 'nodes'>('connections');

  // Generate network connections from cases
  const networkConnections = useMemo(() => {
    const connections: NetworkConnection[] = [];
    const protocols = ['HTTPS', 'HTTP', 'SSH', 'RDP', 'SMB', 'DNS', 'FTP'];
    const ports = ['443', '80', '22', '3389', '445', '53', '21', '8080', '3306'];

    cases.forEach(caseItem => {
      // Generate 3-5 connections per case
      const numConnections = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < numConnections; i++) {
        connections.push({
          id: `CONN-${caseItem.id}-${i}`,
          source: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          destination: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          port: ports[Math.floor(Math.random() * ports.length)],
          protocol: protocols[Math.floor(Math.random() * protocols.length)],
          status: Math.random() > 0.7 ? 'BLOCKED' : Math.random() > 0.8 ? 'SUSPICIOUS' : 'ALLOWED',
          timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          bytesTransferred: Math.floor(Math.random() * 1000000),
          caseId: caseItem.id
        });
      }
    });

    return connections.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [cases]);

  const filteredConnections = useMemo(() => {
    return filterStatus === 'ALL'
      ? networkConnections
      : networkConnections.filter(c => c.status === filterStatus);
  }, [networkConnections, filterStatus]);

  // Extract unique network nodes
  const networkNodes = useMemo(() => {
    const nodeMap = new Map<string, NetworkNode>();

    networkConnections.forEach(conn => {
      [conn.source, conn.destination].forEach(ip => {
        if (!nodeMap.has(ip)) {
          const isInternal = ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.');
          nodeMap.set(ip, {
            id: `NODE-${ip}`,
            ip,
            hostname: isInternal ? `host-${ip.split('.').pop()}` : `external-${ip.split('.').pop()}`,
            type: isInternal ? 'INTERNAL' : 'EXTERNAL',
            reputation: Math.random() > 0.9 ? 'MALICIOUS' : Math.random() > 0.5 ? 'TRUSTED' : 'NEUTRAL',
            country: isInternal ? undefined : ['US', 'CN', 'RU', 'DE', 'UK'][Math.floor(Math.random() * 5)],
            connections: 0
          });
        }
        nodeMap.get(ip)!.connections++;
      });
    });

    return Array.from(nodeMap.values());
  }, [networkConnections]);

  const networkStats = useMemo(() => ({
    totalConnections: networkConnections.length,
    allowed: networkConnections.filter(c => c.status === 'ALLOWED').length,
    blocked: networkConnections.filter(c => c.status === 'BLOCKED').length,
    suspicious: networkConnections.filter(c => c.status === 'SUSPICIOUS').length,
    totalNodes: networkNodes.length,
    maliciousNodes: networkNodes.filter(n => n.reputation === 'MALICIOUS').length,
    externalNodes: networkNodes.filter(n => n.type === 'EXTERNAL').length
  }), [networkConnections, networkNodes]);

  const getStatusColor = (status: NetworkConnection['status']) => {
    switch (status) {
      case 'ALLOWED': return 'green';
      case 'BLOCKED': return 'red';
      case 'SUSPICIOUS': return 'yellow';
    }
  };

  const getReputationColor = (reputation: NetworkNode['reputation']) => {
    switch (reputation) {
      case 'TRUSTED': return 'green';
      case 'MALICIOUS': return 'red';
      case 'NEUTRAL': return 'slate';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Grid */}
      <Grid cols={4}>
        <Card className="p-4 text-center border-t-2 border-t-blue-600">
          <div className="text-[10px] uppercase font-bold text-slate-500">Connections</div>
          <div className="text-2xl font-bold text-white font-mono">{networkStats.totalConnections}</div>
        </Card>
        <Card className="p-4 text-center border-t-2 border-t-green-600">
          <div className="text-[10px] uppercase font-bold text-slate-500">Allowed</div>
          <div className="text-2xl font-bold text-green-500 font-mono">{networkStats.allowed}</div>
        </Card>
        <Card className="p-4 text-center border-t-2 border-t-red-600">
          <div className="text-[10px] uppercase font-bold text-slate-500">Blocked</div>
          <div className="text-2xl font-bold text-red-500 font-mono">{networkStats.blocked}</div>
        </Card>
        <Card className="p-4 text-center border-t-2 border-t-yellow-600">
          <div className="text-[10px] uppercase font-bold text-slate-500">Suspicious</div>
          <div className="text-2xl font-bold text-yellow-500 font-mono">{networkStats.suspicious}</div>
        </Card>
      </Grid>

      {/* View Toggle and Filters */}
      <div className="flex justify-between items-center">
        <div className="flex bg-slate-800 rounded-md p-1">
          <button
            onClick={() => setViewMode('connections')}
            className={`px-4 py-2 text-xs rounded transition-colors ${
              viewMode === 'connections' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Connections
          </button>
          <button
            onClick={() => setViewMode('nodes')}
            className={`px-4 py-2 text-xs rounded transition-colors ${
              viewMode === 'nodes' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Nodes
          </button>
        </div>

        {viewMode === 'connections' && (
          <div className="flex gap-2">
            {['ALL', 'ALLOWED', 'BLOCKED', 'SUSPICIOUS'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Connections View */}
      {viewMode === 'connections' && (
        <div className="space-y-2">
          {filteredConnections.map(conn => (
            <Card
              key={conn.id}
              className="p-4 hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => setSelectedConnection(conn)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-slate-800">
                      <Icons.Network className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex items-center gap-2 text-sm font-mono">
                      <span className="text-slate-300">{conn.source}</span>
                      <Icons.ArrowRight className="w-4 h-4 text-slate-600" />
                      <span className="text-slate-300">{conn.destination}</span>
                      <Badge className="text-[10px]">{conn.port}/{conn.protocol}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-500">{formatBytes(conn.bytesTransferred)}</div>
                    <div className="text-[10px] text-slate-600">{new Date(conn.timestamp).toLocaleString()}</div>
                  </div>
                  <Badge color={getStatusColor(conn.status)} className="text-[10px]">
                    {conn.status}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Nodes View */}
      {viewMode === 'nodes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {networkNodes.map(node => (
            <Card key={node.id} className="p-4 hover:border-blue-500 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    node.type === 'INTERNAL' ? 'bg-blue-600/20 text-blue-400' : 'bg-purple-600/20 text-purple-400'
                  }`}>
                    {node.type === 'INTERNAL' ? (
                      <Icons.Server className="w-5 h-5" />
                    ) : (
                      <Icons.Globe className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{node.hostname}</h3>
                    <p className="text-xs text-slate-400 font-mono">{node.ip}</p>
                  </div>
                </div>
                <Badge color={node.type === 'INTERNAL' ? 'blue' : 'purple'} className="text-[10px]">
                  {node.type}
                </Badge>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Reputation</span>
                  <Badge color={getReputationColor(node.reputation)} className="text-[10px]">
                    {node.reputation}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Connections</span>
                  <span className="font-bold text-cyan-400">{node.connections}</span>
                </div>
                {node.country && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Country</span>
                    <span className="font-bold text-slate-300">{node.country}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Connection Detail Modal */}
      {selectedConnection && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedConnection(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-lg max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Connection Details</h2>
                  <div className="flex items-center gap-2">
                    <Badge>{selectedConnection.protocol}</Badge>
                    <Badge color={getStatusColor(selectedConnection.status)}>
                      {selectedConnection.status}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedConnection(null)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <Icons.X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">Source IP</div>
                  <div className="text-sm font-mono text-white">{selectedConnection.source}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">Destination IP</div>
                  <div className="text-sm font-mono text-white">{selectedConnection.destination}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">Port</div>
                  <div className="text-lg font-bold text-blue-400">{selectedConnection.port}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">Protocol</div>
                  <div className="text-lg font-bold text-purple-400">{selectedConnection.protocol}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">Data</div>
                  <div className="text-lg font-bold text-cyan-400">{formatBytes(selectedConnection.bytesTransferred)}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-1">Timestamp</div>
                <div className="text-sm text-slate-300">{new Date(selectedConnection.timestamp).toLocaleString()}</div>
              </div>

              {selectedConnection.caseId && (
                <div>
                  <div className="text-xs text-slate-500 mb-1">Associated Case</div>
                  <div className="text-sm text-blue-400 font-mono">{selectedConnection.caseId}</div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedConnection(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default IncidentNetwork;
