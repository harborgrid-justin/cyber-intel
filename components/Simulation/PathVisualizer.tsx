
import React from 'react';
import { SystemNode, SimulationPath } from '../../types';
import { Icons } from '../Shared/Icons';
import { Badge } from '../Shared/ui/Badge';

interface PathVisualizerProps {
  paths: SimulationPath[];
  nodes: SystemNode[];
  chokePoints: Map<string, number>;
}

export const PathVisualizer = React.memo<PathVisualizerProps>(({ paths, nodes, chokePoints }) => {
    if (!paths || paths.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                <Icons.AlertTriangle className="w-10 h-10 opacity-50" />
                <div className="text-sm font-bold uppercase tracking-widest">No viable attack path found</div>
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-between w-full relative z-10 max-w-2xl">
                {paths[0].path.map((nodeId: string, i: number) => {
                    const node = nodes.find((n) => n.id === nodeId);
                    return (
                        <React.Fragment key={nodeId}>
                            <div className="bg-slate-900 border border-red-500 p-4 rounded text-center flex flex-col items-center gap-2 w-32 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-in fade-in zoom-in duration-500" style={{ animationDelay: `${i*200}ms` }}>
                                <div className="text-red-400 font-bold text-[10px] uppercase">Step {i+1}</div>
                                <Icons.Server className="w-6 h-6 text-white" />
                                <div className="text-white font-bold text-xs truncate w-full">{node?.name || 'Unknown'}</div>
                            </div>
                            {i < paths[0].path.length - 1 && (
                                <div className="flex-1 flex items-center px-2">
                                    <div className="h-0.5 bg-red-500 w-full animate-pulse"></div>
                                    <div className="text-[9px] text-red-400 -mt-4 bg-slate-950 px-1">LATERAL</div>
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
            <div className="mt-12 w-full max-w-2xl bg-slate-900/50 p-4 rounded border border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">Choke Point Analysis</div>
                <div className="flex gap-4">
                    {Array.from(chokePoints.entries()).map(([nid, count]) => {
                        const nodeName = nodes.find((n) => n.id === nid)?.name;
                        return count > 1 ? ( <Badge key={nid} color="orange">Critical Node: {nodeName} ({count} paths)</Badge> ) : null;
                    })}
                </div>
            </div>
        </>
    );
});
