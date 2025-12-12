
import React, { useMemo, useState } from 'react';
import { Card, CardHeader } from '../Shared/UI';
import { TOKENS } from '../../styles/theme';

interface GraphNode {
  id: string;
  label: string;
  type: 'actor' | 'threat' | 'asset' | 'campaign';
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
  relationship: string;
}

interface NetworkGraphProps {
  nodes?: GraphNode[];
  links?: GraphLink[];
  className?: string;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ nodes, links, className = '' }) => {
  const GRAPH = TOKENS.dark.graph;
  const CHARTS = TOKENS.dark.charts;
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const graphData = useMemo(() => {
    if (!nodes || !links || nodes.length === 0) {
      // Mock network data
      const mockNodes: GraphNode[] = [
        { id: 'actor1', label: 'APT29', type: 'actor', x: 200, y: 150 },
        { id: 'actor2', label: 'Lazarus Group', type: 'actor', x: 400, y: 150 },
        { id: 'threat1', label: 'Ransomware Attack', type: 'threat', severity: 'CRITICAL', x: 200, y: 300 },
        { id: 'threat2', label: 'Phishing Campaign', type: 'threat', severity: 'HIGH', x: 400, y: 300 },
        { id: 'threat3', label: 'Data Exfiltration', type: 'threat', severity: 'HIGH', x: 300, y: 380 },
        { id: 'asset1', label: 'Web Server 01', type: 'asset', x: 100, y: 450 },
        { id: 'asset2', label: 'Database 03', type: 'asset', x: 300, y: 450 },
        { id: 'asset3', label: 'Email Gateway', type: 'asset', x: 500, y: 450 },
        { id: 'campaign1', label: 'Operation Ghost', type: 'campaign', x: 300, y: 50 }
      ];

      const mockLinks: GraphLink[] = [
        { source: 'campaign1', target: 'actor1', relationship: 'attributed_to' },
        { source: 'campaign1', target: 'actor2', relationship: 'attributed_to' },
        { source: 'actor1', target: 'threat1', relationship: 'executed' },
        { source: 'actor2', target: 'threat2', relationship: 'executed' },
        { source: 'actor2', target: 'threat3', relationship: 'executed' },
        { source: 'threat1', target: 'asset1', relationship: 'targets' },
        { source: 'threat1', target: 'asset2', relationship: 'targets' },
        { source: 'threat2', target: 'asset3', relationship: 'targets' },
        { source: 'threat3', target: 'asset2', relationship: 'targets' }
      ];

      return { nodes: mockNodes, links: mockLinks };
    }

    // Calculate positions if not provided
    const processedNodes = nodes.map((node, i) => {
      if (!node.x || !node.y) {
        const angle = (i / nodes.length) * 2 * Math.PI;
        const radius = 200;
        return {
          ...node,
          x: 300 + radius * Math.cos(angle),
          y: 250 + radius * Math.sin(angle)
        };
      }
      return node;
    });

    return { nodes: processedNodes, links };
  }, [nodes, links]);

  const getNodeColor = (node: GraphNode) => {
    if (node.type === 'actor') return GRAPH.actorNode;
    if (node.type === 'threat') {
      switch (node.severity) {
        case 'CRITICAL': return GRAPH.threatCritical;
        case 'HIGH': return GRAPH.threatHigh;
        case 'MEDIUM': return GRAPH.threatMedium;
        default: return CHARTS.primary;
      }
    }
    if (node.type === 'asset') return CHARTS.primary;
    if (node.type === 'campaign') return '#9333ea'; // Purple for campaigns
    return CHARTS.primary;
  };

  const getNodeSize = (node: GraphNode) => {
    if (node.type === 'campaign') return 25;
    if (node.type === 'actor') return 20;
    if (node.type === 'threat') return 18;
    return 15;
  };

  return (
    <Card className={`shadow-lg h-[600px] p-0 overflow-hidden flex flex-col ${className}`}>
      <CardHeader
        title="Network Relationship Graph"
        subtitle="Threat Actor & Asset Connections"
      />
      <div className="flex-1 w-full min-h-0 relative">
        <svg width="100%" height="100%" viewBox="0 0 600 500" className="bg-[var(--colors-surfaceDefault)]">
          {/* Links */}
          <g>
            {graphData.links.map((link, i) => {
              const sourceNode = graphData.nodes.find(n => n.id === link.source);
              const targetNode = graphData.nodes.find(n => n.id === link.target);
              if (!sourceNode || !targetNode) return null;

              return (
                <g key={i}>
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={GRAPH.link}
                    strokeWidth={1.5}
                    strokeDasharray="3,3"
                    opacity={0.6}
                  />
                </g>
              );
            })}
          </g>

          {/* Nodes */}
          <g>
            {graphData.nodes.map((node, i) => (
              <g
                key={node.id}
                onMouseEnter={() => setSelectedNode(node)}
                onMouseLeave={() => setSelectedNode(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={getNodeSize(node)}
                  fill={getNodeColor(node)}
                  stroke={selectedNode?.id === node.id ? '#fff' : 'none'}
                  strokeWidth={selectedNode?.id === node.id ? 2 : 0}
                  opacity={0.85}
                />
                <text
                  x={node.x}
                  y={node.y! + getNodeSize(node) + 12}
                  textAnchor="middle"
                  fill={GRAPH.text}
                  fontSize={10}
                  fontWeight={selectedNode?.id === node.id ? 'bold' : 'normal'}
                >
                  {node.label}
                </text>
              </g>
            ))}
          </g>
        </svg>

        {/* Tooltip */}
        {selectedNode && (
          <div
            className="absolute bg-[var(--colors-surfaceRaised)] border border-[var(--colors-borderDefault)] rounded-lg p-3 shadow-xl pointer-events-none"
            style={{
              top: '20px',
              right: '20px',
              minWidth: '200px'
            }}
          >
            <div className="text-sm">
              <p className="font-bold text-[var(--colors-textPrimary)] mb-1">{selectedNode.label}</p>
              <p className="text-xs text-[var(--colors-textSecondary)] mb-1">
                Type: <span className="text-[var(--colors-primary)]">{selectedNode.type.toUpperCase()}</span>
              </p>
              {selectedNode.severity && (
                <p className="text-xs text-[var(--colors-textSecondary)]">
                  Severity: <span style={{ color: getNodeColor(selectedNode) }}>{selectedNode.severity}</span>
                </p>
              )}
              <p className="text-xs text-[var(--colors-textSecondary)] mt-2">
                Connections: {graphData.links.filter(l => l.source === selectedNode.id || l.target === selectedNode.id).length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-4 pb-3 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#9333ea' }} />
          <span style={{ color: CHARTS.text }}>Campaign</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GRAPH.actorNode }} />
          <span style={{ color: CHARTS.text }}>Actor</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GRAPH.threatCritical }} />
          <span style={{ color: CHARTS.text }}>Critical Threat</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHARTS.primary }} />
          <span style={{ color: CHARTS.text }}>Asset</span>
        </div>
      </div>
    </Card>
  );
};

export default NetworkGraph;
