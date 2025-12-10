
import React, { useMemo } from 'react';
// Fix: Import types from the central types file.
import { Threat } from '../../types';
import { TOKENS } from '../../styles/theme';

interface NetworkGraphProps {
  threats: Threat[];
}

const NetworkGraph: React.FC<NetworkGraphProps> = React.memo(({ threats }) => {
  if (threats.length === 0) return null;
  const GRAPH = TOKENS.dark.graph;

  const { nodes, links } = useMemo(() => {
    const actors: string[] = Array.from(new Set(threats.map(t => t.threatActor).filter(a => a !== 'Unknown')));
    const cx = 200, cy = 150;
    const calcNodes: { id: string; x: number; y: number; type: 'ACTOR' | 'THREAT'; label: string; color: string }[] = [];
    const calcLinks: { sourceX: number; sourceY: number; targetX: number; targetY: number }[] = [];
    if (actors.length > 0) actors.forEach((actor, i) => { const angle = (i / Math.max(1, actors.length)) * 2 * Math.PI; calcNodes.push({ id: `actor-${actor}`, x: cx + 60 * Math.cos(angle), y: cy + 60 * Math.sin(angle), type: 'ACTOR', label: actor, color: GRAPH.actorNode }); });
    else calcNodes.push({ id: 'center', x: cx, y: cy, type: 'ACTOR', label: 'Cluster', color: '#64748b' });
    threats.forEach((threat, i) => {
      const angle = (i / threats.length) * 2 * Math.PI;
      const tx = cx + 120 * Math.cos(angle), ty = cy + 120 * Math.sin(angle);
      calcNodes.push({ id: `threat-${threat.id}`, x: tx, y: ty, type: 'THREAT', label: threat.indicator, color: threat.severity === 'CRITICAL' ? GRAPH.threatCritical : threat.severity === 'HIGH' ? GRAPH.threatHigh : GRAPH.threatMedium });
      const actorNode = calcNodes.find(n => n.type === 'ACTOR' && n.label === threat.threatActor) || calcNodes.find(n => n.id === 'center');
      if (actorNode) calcLinks.push({ sourceX: tx, sourceY: ty, targetX: actorNode.x, targetY: actorNode.y });
    });
    return { nodes: calcNodes, links: calcLinks };
  }, [threats, GRAPH]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col items-center">
      <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-2 w-full text-left">Relationship Graph</h4>
      <svg width="100%" height={300} viewBox="0 0 400 300" className="bg-slate-900/50 rounded border border-slate-800/50">
        <g>{links.map((link, i) => <line key={i} x1={link.sourceX} y1={link.sourceY} x2={link.targetX} y2={link.targetY} stroke={GRAPH.link} strokeWidth="1" strokeOpacity="0.5"/>)}</g>
        <g>{nodes.map((node) => ( <g key={node.id}><circle cx={node.x} cy={node.y} r={node.type === 'ACTOR' ? 12 : 6} fill={node.color} stroke="#1e293b" strokeWidth="2" /><text x={node.x} y={node.y + (node.type === 'ACTOR' ? 20 : 15)} textAnchor="middle" fill={GRAPH.text} fontSize={node.type === 'ACTOR' ? 10 : 8} fontWeight={node.type === 'ACTOR' ? 'bold' : 'normal'} className="font-mono">{node.label}</text></g> ))}</g>
      </svg>
      <div className="flex gap-4 mt-2 text-[10px] text-slate-500">
         <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor: GRAPH.actorNode}}></span> Actor / Critical</div>
         <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor: GRAPH.threatHigh}}></span> High Sev</div>
         <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor: GRAPH.threatMedium}}></span> Medium Sev</div>
      </div>
    </div>
  );
});
export default NetworkGraph;