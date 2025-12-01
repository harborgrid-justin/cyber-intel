
import React, { useState, useMemo } from 'react';
import { Card, CardHeader, Badge, Button, Grid } from '../../Shared/UI';
import { SegmentationPolicy, TrafficFlow } from '../../../types';
import { OrchestratorLogic } from '../../../services/logic/OrchestratorLogic';
import ResponsiveTable from '../../Shared/ResponsiveTable';

const MOCK_POLICIES: SegmentationPolicy[] = [
  { id: 'pol-1', name: 'Isolate Payment DB', source: '*', destination: 'PROD-DB-PAYMENT', port: '5432', action: 'DENY', status: 'ACTIVE' },
  { id: 'pol-2', name: 'Allow Web to App', source: 'DMZ-WEB', destination: 'APP-CLUSTER', port: '443', action: 'ALLOW', status: 'ACTIVE' },
  { id: 'pol-3', name: 'Block RDP External', source: 'EXTERNAL', destination: '*', port: '3389', action: 'DENY', status: 'DRAFT' },
];

const MOCK_FLOWS: TrafficFlow[] = [
  { id: 'fl-1', source: '192.168.1.5 (DEV)', dest: '10.0.0.50 (PROD-DB)', port: '5432', allowed: true, timestamp: '10:00:01' },
  { id: 'fl-2', source: '10.0.5.20 (DMZ)', dest: '10.0.0.12 (APP)', port: '443', allowed: true, timestamp: '10:00:05' },
  { id: 'fl-3', source: '203.0.113.5 (EXT)', dest: '10.0.0.5 (WORKSTATION)', port: '3389', allowed: true, timestamp: '10:00:12' },
];

export const SegmentationView: React.FC = () => {
  const [policies, setPolicies] = useState(MOCK_POLICIES);
  const [flows, setFlows] = useState(MOCK_FLOWS);
  const [simulationResult, setSimulationResult] = useState<{ id: string, blocked: number, services: string[] } | null>(null);

  const handleSimulate = (policy: SegmentationPolicy) => {
    const result = OrchestratorLogic.simulatePolicy(policy, flows);
    setSimulationResult({
      id: policy.id,
      blocked: result.blockedCount,
      services: result.affectedServices
    });
  };

  const lateralPaths = useMemo(() => {
     // Mocking node data for standalone visual
     return OrchestratorLogic.detectLateralPaths([
       { id: 'n1', name: 'Dev-Laptop', status: 'ONLINE', dataSensitivity: 'PUBLIC', securityControls: [], load: 0, latency: 0, dataVolumeGB: 0 },
       { id: 'n2', name: 'Core-DB', status: 'ONLINE', dataSensitivity: 'RESTRICTED', securityControls: [], load: 0, latency: 0, dataVolumeGB: 0 }
     ]);
  }, []);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
         <Card className="lg:col-span-2 p-0 overflow-hidden">
            <CardHeader 
              title="Active Segmentation Policies" 
              action={<Button variant="primary" className="text-[10px] py-1">+ NEW POLICY</Button>}
            />
            <div className="p-4">
               <ResponsiveTable<SegmentationPolicy>
                  data={policies}
                  keyExtractor={p => p.id}
                  columns={[
                     { header: 'Rule Name', render: p => <span className="text-white font-bold">{p.name}</span> },
                     { header: 'Source', render: p => <Badge color="slate">{p.source}</Badge> },
                     { header: 'Dest', render: p => <Badge color="slate">{p.destination}</Badge> },
                     { header: 'Port', render: p => <span className="font-mono text-xs">{p.port}</span> },
                     { header: 'Action', render: p => <Badge color={p.action === 'ALLOW' ? 'green' : 'red'}>{p.action}</Badge> },
                     { header: 'Simulate', render: p => <Button onClick={() => handleSimulate(p)} variant="secondary" className="text-[10px] py-1">TEST</Button> }
                  ]}
                  renderMobileCard={p => <div>{p.name}</div>}
               />
            </div>
         </Card>

         <Card className="p-0 overflow-hidden flex flex-col">
            <CardHeader title="Simulation Results" />
            <div className="p-6 flex-1 flex items-center justify-center">
               {simulationResult ? (
                 <div className="text-center w-full">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">Policy Impact Analysis</div>
                    <div className="text-4xl font-mono text-white font-bold mb-4">{simulationResult.blocked}</div>
                    <div className="text-xs text-slate-400 mb-4">Flows would be blocked</div>
                    
                    {simulationResult.blocked > 0 && (
                      <div className="bg-red-900/10 border border-red-900/50 p-3 rounded text-left">
                         <div className="text-[10px] text-red-400 font-bold uppercase mb-1">Affected Services</div>
                         <ul className="text-xs text-red-300 list-disc pl-4">
                            {simulationResult.services.map(s => <li key={s}>{s}</li>)}
                         </ul>
                      </div>
                    )}
                    {simulationResult.blocked === 0 && <div className="text-green-500 text-xs font-bold">Safe to Apply</div>}
                 </div>
               ) : (
                 <div className="text-slate-600 text-center">
                    <div className="text-4xl mb-2">?</div>
                    <div className="text-xs uppercase tracking-widest font-bold">Select a policy to simulate</div>
                 </div>
               )}
            </div>
         </Card>
      </div>

      <Card className="flex-1 p-0 overflow-hidden flex flex-col">
         <CardHeader title="Lateral Movement Paths (Zone Breaches)" />
         <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto">
            {lateralPaths.length > 0 ? lateralPaths.map((path, i) => (
               <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                     <span className="text-slate-400">{path.path[0]}</span>
                     <span className="text-slate-600">→</span>
                     <span className="text-slate-500">{path.path[1]}</span>
                     <span className="text-slate-600">→</span>
                     <span className="text-red-400 font-bold">{path.path[2]}</span>
                  </div>
                  <Badge color="red">RISK: {path.risk}</Badge>
               </div>
            )) : <div className="col-span-2 text-center text-slate-500 p-8">No unsegmented paths detected.</div>}
         </div>
      </Card>
    </div>
  );
};
