
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, Badge, Button, ProgressBar, Grid } from '../../Shared/UI';
import ResponsiveTable from '../../Shared/ResponsiveTable';
import { Device, Pcap, Artifact } from '../../../types';
import { ForensicsLogic } from '../../../services/logic/ForensicsLogic';
import { threatData } from '../../../services/dataLayer';

// --- Device Locker ---
export const DeviceLockerView: React.FC<{ devices: Device[] }> = ({ devices }) => {
  const [recommendations, setRecommendations] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadRecs = async () => {
        const recs: Record<string, string> = {};
        for(const d of devices) {
            recs[d.id] = await ForensicsLogic.suggestDeviceAction(d);
        }
        setRecommendations(recs);
    };
    loadRecs();
  }, [devices]);

  return (
    <Card className="p-0 overflow-hidden h-full flex flex-col">
      <CardHeader title="Secure Device Inventory" />
      <div className="flex-1 overflow-y-auto p-4">
          <ResponsiveTable<Device> data={devices} keyExtractor={d => d.id} columns={[
              { header: 'Device', render: d => <span className="font-bold text-white">{d.name}</span> },
              { header: 'Serial', render: d => <span className="font-mono text-xs text-slate-400">{d.serial}</span> },
              { header: 'Custodian', render: d => <span className="text-cyan-500 text-xs">{d.custodian}</span> },
              { header: 'Status', render: d => <Badge color={d.status==='SECURE'?'green':d.status==='QUARANTINED'?'red':'orange'}>{d.status}</Badge> },
              { header: 'Recommendation', render: d => <span className="text-[10px] text-slate-400 font-bold uppercase">{recommendations[d.id] || 'ANALYZING...'}</span> }
          ]} renderMobileCard={d => <div>{d.name}</div>} />
      </div>
    </Card>
  );
};

// --- Network Captures ---
export const NetworkCapturesView: React.FC<{ pcaps: Pcap[] }> = ({ pcaps }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pcaps.map(p => (
            <Card key={p.id} className="p-4 border-l-4 border-l-blue-500 hover:bg-slate-900 transition-colors">
                <div className="flex justify-between items-start mb-2"><div className="font-bold text-white font-mono">{p.name}</div><Badge>{p.protocol}</Badge></div>
                <div className="text-xs text-slate-400 mb-4">Source: {p.source} • Size: {p.size}</div>
                <div className="bg-slate-950 p-2 rounded font-mono text-[10px] text-green-400 mb-3 border border-slate-800">
                    0000  45 00 00 3c 1c 46 40 00  40 06 b1 e6 c0 a8 00 01  E..&lt;F@.@........
                </div>
                <div className="flex gap-2"><Button variant="secondary" className="flex-1 text-[10px]">REASSEMBLE STREAM</Button><Button variant="outline" className="flex-1 text-[10px]">DOWNLOAD PCAP</Button></div>
            </Card>
        ))}
    </div>
  </div>
);

// --- Storage Ops ---
export const StorageOpsView: React.FC<{ artifacts: Artifact[] }> = ({ artifacts }) => {
  const [metrics, setMetrics] = useState({ totalGB: 0, cost: 0, retentionRisk: 0 });

  useEffect(() => {
    ForensicsLogic.calculateStorageProjection(artifacts).then(setMetrics);
  }, [artifacts]);

  return (
    <div className="space-y-6">
        <Grid cols={3}>
            <Card className="p-6 text-center"><div className="text-3xl font-bold text-white mb-1">{metrics.totalGB} GB</div><div className="text-xs text-slate-500 font-bold uppercase">Total Evidence Size</div></Card>
            <Card className="p-6 text-center"><div className="text-3xl font-bold text-green-500 mb-1">${metrics.cost}/mo</div><div className="text-xs text-slate-500 font-bold uppercase">Projected Cost (Hot)</div></Card>
            <Card className="p-6 text-center"><div className="text-3xl font-bold text-orange-500 mb-1">{metrics.retentionRisk} Items</div><div className="text-xs text-slate-500 font-bold uppercase">Retention Policy Risk</div></Card>
        </Grid>
        <Card className="p-6">
            <h3 className="font-bold text-white mb-4">Storage Tier Distribution</h3>
            <div className="space-y-4">
                <div><div className="flex justify-between text-xs text-slate-400 mb-1"><span>Hot Storage (NVMe)</span><span>65%</span></div><ProgressBar value={65} color="cyan" /></div>
                <div><div className="flex justify-between text-xs text-slate-400 mb-1"><span>Cold Archive (Tape)</span><span>35%</span></div><ProgressBar value={35} color="blue" /></div>
            </div>
        </Card>
    </div>
  );
};
