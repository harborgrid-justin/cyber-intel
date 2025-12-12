
import React, { useMemo, useState } from 'react';
import { Threat } from '../../types';
import { TOKENS } from '../../styles/theme';

interface NetworkGraphProps {
  threats: Threat[];
  isLoading?: boolean;
  error?: string | null;
}

const NetworkGraph: React.FC<NetworkGraphProps> = React.memo(({ threats, isLoading = false, error = null }) => {
  const GRAPH = TOKENS.dark.graph;
  const CHARTS = TOKENS.dark.charts;
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const { nodes, links } = useMemo(() => {
    if (!threats || threats.length === 0) {
      return { nodes: [], links: [] };
    }

    try {
      const actors: string[] = Array.from(new Set(threats.map(t => t.threatActor).filter(a => a !== 'Unknown')));
      const cx = 200, cy = 150;
      const calcNodes: { id: string; x: number; y: number; type: 'ACTOR' | 'THREAT'; label: string; color: string }[] = [];
      const calcLinks: { sourceX: number; sourceY: number; targetX: number; targetY: number }[] = [];

      if (actors.length > 0) {
        actors.forEach((actor, i) => {
          const angle = (i / Math.max(1, actors.length)) * 2 * Math.PI;
          calcNodes.push({
            id: `actor-${actor}`,
            x: cx + 60 * Math.cos(angle),
            y: cy + 60 * Math.sin(angle),
            type: 'ACTOR',
            label: actor,
            color: GRAPH.actorNode
          });
        });
      } else {
        calcNodes.push({ id: 'center', x: cx, y: cy, type: 'ACTOR', label: 'Cluster', color: '#64748b' });
      }

      threats.forEach((threat, i) => {
        const angle = (i / threats.length) * 2 * Math.PI;
        const tx = cx + 120 * Math.cos(angle), ty = cy + 120 * Math.sin(angle);
        calcNodes.push({
          id: `threat-${threat.id}`,
          x: tx,
          y: ty,
          type: 'THREAT',
          label: threat.indicator.length > 15 ? threat.indicator.substring(0, 12) + '...' : threat.indicator,
          color: threat.severity === 'CRITICAL' ? GRAPH.threatCritical : threat.severity === 'HIGH' ? GRAPH.threatHigh : GRAPH.threatMedium
        });
        const actorNode = calcNodes.find(n => n.type === 'ACTOR' && n.label === threat.threatActor) || calcNodes.find(n => n.id === 'center');
        if (actorNode) calcLinks.push({ sourceX: tx, sourceY: ty, targetX: actorNode.x, targetY: actorNode.y });
      });

      return { nodes: calcNodes, links: calcLinks };
    } catch (err) {
      console.error('Error calculating graph layout:', err);
      return { nodes: [], links: [] };
    }
  }, [threats, GRAPH]);

  // Loading State
  if (isLoading) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col items-center min-h-[350px] justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-3" style={{ borderColor: CHARTS.primary }} />
          <p className="text-sm text-slate-400">Loading network graph...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col items-center min-h-[350px] justify-center">
        <div className="text-center px-4">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-sm font-bold text-red-500 mb-2">{error}</p>
          <p className="text-xs text-slate-500">Unable to render network graph</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (threats.length === 0 || nodes.length === 0) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col items-center min-h-[350px] justify-center">
        <div className="text-center px-4">
          <div className="text-4xl mb-3">🕸️</div>
          <p className="text-sm font-bold text-white mb-2">No Network Data</p>
          <p className="text-xs text-slate-500">Threat relationships will appear here once data is available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col items-center">
      <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-2 w-full text-left">Relationship Graph</h4>
      <div className="w-full" style={{ position: 'relative' }}>
        <svg
          width="100%"
          height={300}
          viewBox="0 0 400 300"
          className="bg-slate-900/50 rounded border border-slate-800/50"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Links */}
          <g>
            {links.map((link, i) => (
              <line
                key={i}
                x1={link.sourceX}
                y1={link.sourceY}
                x2={link.targetX}
                y2={link.targetY}
                stroke={GRAPH.link}
                strokeWidth="1"
                strokeOpacity="0.5"
              />
            ))}
          </g>

          {/* Nodes */}
          <g>
            {nodes.map((node) => (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.type === 'ACTOR' ? 12 : 6}
                  fill={node.color}
                  stroke={hoveredNode === node.id ? '#fff' : '#1e293b'}
                  strokeWidth={hoveredNode === node.id ? '3' : '2'}
                  opacity={hoveredNode === node.id ? 1 : 0.9}
                />
                <text
                  x={node.x}
                  y={node.y + (node.type === 'ACTOR' ? 20 : 15)}
                  textAnchor="middle"
                  fill={GRAPH.text}
                  fontSize={node.type === 'ACTOR' ? 10 : 8}
                  fontWeight={node.type === 'ACTOR' ? 'bold' : 'normal'}
                  className="font-mono pointer-events-none"
                >
                  {node.label}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-2 text-[10px] text-slate-500 w-full justify-center">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{backgroundColor: GRAPH.actorNode}}></span>
          <span>Actor / Critical</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{backgroundColor: GRAPH.threatHigh}}></span>
          <span>High Sev</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{backgroundColor: GRAPH.threatMedium}}></span>
          <span>Medium Sev</span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-3 text-[10px] text-slate-600 font-mono w-full text-center">
        {nodes.filter(n => n.type === 'ACTOR').length} Actors • {nodes.filter(n => n.type === 'THREAT').length} Threats • {links.length} Connections
      </div>
    </div>
  );
});

NetworkGraph.displayName = 'NetworkGraph';

export default NetworkGraph;
