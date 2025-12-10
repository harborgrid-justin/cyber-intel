
import React, { useRef, useEffect } from 'react';
import { GRAPH_WORKER_CODE } from '../../services/workers/GraphWorker';

interface GraphNode {
  id: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  [key: string]: unknown;
}

interface Props { nodes: GraphNode[] }

export const OffscreenGraph: React.FC<Props> = ({ nodes }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (canvasRef.current && !workerRef.current) {
      const blob = new Blob([GRAPH_WORKER_CODE], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));
      workerRef.current = worker;

      const offscreen = canvasRef.current.transferControlToOffscreen();
      worker.postMessage({ canvas: offscreen }, [offscreen]);
      
      // Init nodes with random velocity
      const physicsNodes = nodes.map(n => ({
          ...n,
          x: Math.random() * 300,
          y: Math.random() * 300,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2
      }));
      worker.postMessage({ nodes: physicsNodes });
    }
  }, [nodes]);

  useEffect(() => {
      // Cleanup
      return () => workerRef.current?.terminate();
  }, []);

  return (
    <div className="w-full h-full bg-slate-950 rounded border border-slate-800">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
