
import React, { useEffect, useRef } from 'react';
// Fix: Import types from the central types file.
import { Threat } from '../../types';
import { threatData } from '../../services/dataLayer';
import { GRAPH_WORKER_CODE } from '../../services/workers/GraphWorker';
import { useDataStore } from '../../hooks/useDataStore';

interface GraphNode {
  id: string; x: number; y: number; vx: number; vy: number; type: 'ACTOR' | 'THREAT'; label: string; color: string; r: number;
}

export const InteractiveGraph: React.FC<{ threats: Threat[] }> = ({ threats }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const themeConfig = useDataStore(() => threatData.getThemeConfig());

  useEffect(() => {
    if (canvasRef.current && !workerRef.current) {
      const blob = new Blob([GRAPH_WORKER_CODE], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));
      workerRef.current = worker;
      const offscreen = canvasRef.current.transferControlToOffscreen();
      worker.postMessage({ canvas: offscreen }, [offscreen]);
    }
    return () => { workerRef.current?.terminate(); workerRef.current = null; };
  }, []);

  useEffect(() => {
    if (!workerRef.current) return;
    const actors = Array.from(new Set(threats.map(t => t.threatActor).filter(a => a !== 'Unknown')));
    const nodes: GraphNode[] = [];
    
    actors.forEach((actor, i) => { 
        const angle = (i / actors.length) * Math.PI * 2; 
        nodes.push({ 
            id: `actor-${actor}`, 
            x: 400 + Math.cos(angle) * 50, 
            y: 250 + Math.sin(angle) * 50, 
            vx: 0, 
            vy: 0, 
            type: 'ACTOR', 
            label: String(actor), 
            color: String(themeConfig.graph.actorNode), 
            r: 15 
        }); 
    });
    
    threats.forEach((t, i) => { 
        const angle = (i / threats.length) * Math.PI * 2; 
        const colorValue = String(t.severity === 'CRITICAL' ? themeConfig.graph.threatCritical : themeConfig.graph.threatMedium); 
        nodes.push({ 
            id: String(t.id), 
            x: 400 + Math.cos(angle) * 150, 
            y: 250 + Math.sin(angle) * 150, 
            vx: 0, 
            vy: 0, 
            type: 'THREAT', 
            label: String(t.indicator), 
            color: colorValue, 
            r: 6 
        }); 
    });
    
    workerRef.current.postMessage({ nodes });
  }, [threats, themeConfig]);

  return (
    <div className="w-full h-full bg-slate-950/50 rounded-lg overflow-hidden border border-slate-800 relative">
        <div className="absolute top-2 left-2 text-[10px] text-slate-500 font-mono pointer-events-none">PHYSICS: WORKER THREAD</div>
        <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
