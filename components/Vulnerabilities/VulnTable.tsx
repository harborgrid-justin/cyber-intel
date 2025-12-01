
import React from 'react';
import ResponsiveTable from '../Shared/ResponsiveTable';
import { Badge, Button } from '../Shared/UI';
import { Vulnerability } from '../../types';
import { VulnerabilityLogic } from '../../services/logic/VulnerabilityLogic';

interface VulnTableProps {
  data: Vulnerability[];
  onPatch: (id: string) => void;
  showSla?: boolean;
}

const VulnTable: React.FC<VulnTableProps> = ({ data, onPatch, showSla = false }) => (
  <ResponsiveTable<Vulnerability>
    data={data}
    keyExtractor={c => c.id}
    columns={[
      { header: 'CVE ID', render: c => <div className="flex flex-col"><span className="text-white font-mono font-bold">{c.id}</span>{c.killChainReady && <span className="text-[9px] bg-purple-900 text-purple-200 px-1 rounded border border-purple-500 w-fit mt-1 animate-pulse">KILL CHAIN READY</span>}</div> },
      { header: 'CVSS', render: c => <span className={`font-bold ${c.score > 9 ? 'text-red-500' : 'text-orange-500'}`}>{c.score}</span> },
      { header: 'Name', render: c => <span className="text-slate-300">{c.name}</span> },
      { header: 'Attributes', render: c => <div className="flex gap-1">{c.zeroDay && <Badge color="red">0-DAY</Badge>}{c.exploited && <Badge color="orange">EXPL</Badge>}</div> },
      { header: 'Status', render: c => <Badge color={c.status === 'PATCHED' ? 'green' : c.status === 'UNPATCHED' ? 'red' : 'orange'}>{c.status}</Badge> },
      ...(showSla ? [{ 
          header: 'SLA', 
          render: (c: Vulnerability) => {
             const sla = VulnerabilityLogic.calculateRemediationSLA(c);
             return (
                 <div className={`text-[10px] font-bold ${sla.status === 'BREACHED' ? 'text-red-500' : sla.status === 'WARNING' ? 'text-orange-500' : 'text-green-500'}`}>
                     {sla.daysRemaining} Days Left
                 </div>
             );
          }
      }] : []),
      { header: 'Action', render: c => c.status !== 'PATCHED' ? <Button onClick={() => onPatch(c.id)} variant="text" className="text-green-500 text-[10px]">MARK PATCHED</Button> : null }
    ]}
    renderMobileCard={c => (
      <div className="flex justify-between items-center">
         <div><div className="text-white font-bold">{c.id}</div><div className="text-xs text-slate-500">{c.name}</div></div>
         <div className="flex flex-col items-end"><Badge color="red">{c.score}</Badge><span className="text-[10px] text-slate-500 mt-1">{c.status}</span></div>
      </div>
    )}
  />
);
export default VulnTable;
