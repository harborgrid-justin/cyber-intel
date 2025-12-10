

import React, { useEffect, useRef } from 'react';
// Fix: Import types from the central types file.
import { Threat } from '../../types';

interface GlobeProps { threats: Threat[]; }

export const HolographicGlobe: React.FC<GlobeProps> = ({ threats }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let rot = 0;
    let animId: number;
    const particles: {x:number, y:number, z:number, color: string}[] = [];
    for(let i=0; i<300; i++) {
        const phi = Math.acos(-1 + (2 * i) / 300);
        const theta = Math.sqrt(300 * Math.PI) * phi;
        particles.push({ x: 150 * Math.cos(theta) * Math.sin(phi), y: 150 * Math.sin(theta) * Math.sin(phi), z: 150 * Math.cos(phi), color: '#1e293b' });
    }
    threats.slice(0, 30).forEach(t => particles.push({ x: (Math.random() - 0.5) * 300, y: (Math.random() - 0.5) * 300, z: 150, color: t.severity === 'CRITICAL' ? '#ef4444' : '#06b6d4' }));
    const render = () => {
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        rot += 0.005;
        particles.sort((a, b) => (b.z * Math.cos(rot) - b.x * Math.sin(rot)) - (a.z * Math.cos(rot) - a.x * Math.sin(rot)));
        particles.forEach(p => {
            const x1 = p.x * Math.cos(rot) - p.z * Math.sin(rot);
            const z1 = p.z * Math.cos(rot) + p.x * Math.sin(rot);
            const scale = 300 / (300 + z1); 
            const x2d = x1 * scale + (canvas.width / 2);
            const y2d = p.y * scale + (canvas.height / 2);
            if (z1 > -100) {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(x2d, y2d, Math.max(0.5, 2 * scale), 0, Math.PI*2);
                ctx.fill();
            }
        });
        ctx.fillStyle = 'rgba(6, 182, 212, 0.1)';
        ctx.fillRect(0, (Date.now() % 2000) / 2000 * canvas.height, canvas.width, 1);
        animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [threats]);

  return (
    <div className="w-full h-full relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
        <div className="absolute top-4 left-4 z-10 pointer-events-none"><h3 className="text-cyan-500 font-bold uppercase tracking-widest text-xs">Global Telemetry</h3><div className="text-[10px] text-slate-500 font-mono">LIVE FEED CONNECTED</div></div>
        <canvas ref={canvasRef} width={800} height={500} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#0f172a_100%)] pointer-events-none"></div>
    </div>
  );
};