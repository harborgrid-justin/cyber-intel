
import React from 'react';
import { Threat } from '../../types';
import { CONFIG } from '../../config';

interface NetworkGraphProps {
  threats: Threat[];
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ threats }) => {
  if (threats.length === 0) return null;
  const { GRAPH } = CONFIG.THEME;

  // Extract nodes: unique actors and threats
  const actors: string[] = Array.from(new Set(threats.map(t => t.threatActor).filter(a => a !== 'Unknown')));
  
  const width = 400;
  const height = 300;
  const cx = width / 2;
  const cy = height / 2;
  
  const nodes: { id: string; x: number; y: number; type: 'ACTOR' | 'THREAT'; label: string; color: string }[] = [];
  const links: { sourceX: number; sourceY: number; targetX: number; targetY: number }[] = [];

  // Position Actors (Inner Circle)
  const actorRadius = 60;
  if (actors.length > 0) {
      actors.forEach((actor, i) => {
        const angle = (i / Math.max(1, actors.length)) * 2 * Math.PI;
        nodes.push({
          id: `actor-${actor}`,
          x: cx + actorRadius * Math.cos(angle),
          y: cy + actorRadius * Math.sin(angle),
          type: 'ACTOR',
          label: actor,
          color: GRAPH.ACTOR_NODE
        });
      });
  } else {
     nodes.push({ id: 'center', x: cx, y: cy, type: 'ACTOR', label: 'Cluster', color: '#64748b' });
  }

  // Position Threats (Outer Circle)
  const threatRadius = 120;
  threats.forEach((threat, i) => {
    const angle = (i / threats.length) * 2 * Math.PI;
    const tx = cx + threatRadius * Math.cos(angle);
    const ty = cy + threatRadius * Math.sin(angle);
    
    nodes.push({
      id: `threat-${threat.id}`,
      x: tx,
      y: ty,
      type: 'THREAT',
      label: threat.indicator,
      color: threat.severity === 'CRITICAL' ? GRAPH.THREAT_CRITICAL : threat.severity === 'HIGH' ? GRAPH.THREAT_HIGH : GRAPH.THREAT_MEDIUM
    });

    const actorNode = nodes.find(n => n.type === 'ACTOR' && n.label === threat.threatActor);
    const centerNode = nodes.find(n => n.id === 'center');
    
    if (actorNode) {
      links.push({ sourceX: tx, sourceY: ty, targetX: actorNode.x, targetY: actorNode.y });
    } else if (centerNode) {
      links.push({ sourceX: tx, sourceY: ty, targetX: centerNode.x, targetY: centerNode.y });
    }
  });

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col items-center">
      <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-2 w-full text-left">Relationship Graph</h4>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="bg-slate-900/50 rounded border border-slate-800/50">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="15" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill={GRAPH.LINK} />
          </marker>
        </defs>
        {links.map((link, i) => (
          <line key={i} x1={link.sourceX} y1={link.sourceY} x2={link.targetX} y2={link.targetY} stroke={GRAPH.LINK} strokeWidth="1" strokeOpacity="0.5"/>
        ))}
        {nodes.map((node) => (
          <g key={node.id}>
             <circle cx={node.x} cy={node.y} r={node.type === 'ACTOR' ? 12 : 6} fill={node.color} stroke="#1e293b" strokeWidth="2" />
             <text x={node.x} y={node.y + (node.type === 'ACTOR' ? 20 : 15)} textAnchor="middle" fill={GRAPH.TEXT} fontSize={node.type === 'ACTOR' ? 10 : 8} fontWeight={node.type === 'ACTOR' ? 'bold' : 'normal'} className="font-mono">{node.label}</text>
          </g>
        ))}
      </svg>
      <div className="flex gap-4 mt-2 text-[10px] text-slate-500">
         <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Actor / Critical</div>
         <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> High Sev</div>
         <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Medium Sev</div>
      </div>
    </div>
  );
};
export default NetworkGraph;
