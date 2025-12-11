
import React from 'react';
import { IncidentReport } from '../../../types';
import { Card, Grid, ProgressBar, Button, CardHeader } from '../../Shared/UI';
import { Icons } from '../../Shared/Icons';

interface Props {
  reports: IncidentReport[];
  onSelect: (id: string) => void;
}

export const ReportsOverview: React.FC<Props> = ({ reports, onSelect }) => {
    const drafts = reports.filter(r => r.status === 'DRAFT');
    const published = reports.filter(r => r.status === 'READY');
    
    const reportTypes = [
        { label: 'Executive', count: reports.filter(r => r.type === 'Executive').length, color: 'purple' },
        { label: 'Forensic', count: reports.filter(r => r.type === 'Forensic').length, color: 'blue' },
        { label: 'Technical', count: reports.filter(r => r.type === 'Technical').length, color: 'cyan' },
        { label: 'Compliance', count: reports.filter(r => r.type === 'Compliance').length, color: 'green' },
    ];

    return (
        <div className="flex-1 flex flex-col gap-6 h-full overflow-y-auto p-4 md:p-6">
           <Grid cols={4}>
              <Card className="p-4 border-t-2 border-t-cyan-500"><div className="text-[10px] font-bold text-slate-500 uppercase">Total Assets</div><div className="text-3xl font-bold text-white">{reports.length}</div></Card>
              <Card className="p-4 border-t-2 border-t-green-500"><div className="text-[10px] font-bold text-green-400 uppercase">Published</div><div className="text-3xl font-bold text-green-500">{published.length}</div></Card>
              <Card className="p-4 border-t-2 border-t-yellow-500"><div className="text-[10px] font-bold text-yellow-400 uppercase">Active Drafts</div><div className="text-3xl font-bold text-yellow-500">{drafts.length}</div></Card>
              <Card className="p-4 border-t-2 border-t-slate-500"><div className="text-[10px] font-bold text-slate-500 uppercase">Archived</div><div className="text-3xl font-bold text-slate-400">{reports.filter(r => r.status === 'ARCHIVED').length}</div></Card>
           </Grid>

           <Grid cols={3} className="flex-1 min-h-0">
              <Card className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
                 <CardHeader title="Production Pipeline" />
                 <div className="p-6 flex-1 overflow-y-auto space-y-4">
                    {drafts.length > 0 ? drafts.slice(0, 5).map(d => (
                        <div key={d.id} onClick={() => onSelect(d.id)} className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-lg hover:border-cyan-500 cursor-pointer group">
                            <div className="p-3 bg-yellow-900/20 text-yellow-500"><Icons.FileText className="w-5 h-5" /></div>
                            <div className="flex-1 min-w-0"><h4 className="font-bold text-white group-hover:text-cyan-400 truncate">{d.title}</h4><div className="text-xs text-slate-500 truncate">Started by {d.author}</div></div>
                            <Button variant="secondary" className="text-[10px]">RESUME</Button>
                        </div>
                    )) : <div className="h-full flex items-center justify-center text-slate-600">Pipeline Clear</div>}
                 </div>
              </Card>
              <Card className="p-0 overflow-hidden"><CardHeader title="Report Types" /><div className="p-6 space-y-4">{reportTypes.map((t, i) => (<div key={i}><div className="flex justify-between text-xs text-slate-400 mb-1"><span className="font-bold uppercase">{t.label}</span><span>{t.count}</span></div><ProgressBar value={t.count} max={Math.max(...reports.map(r => 1), 10)} color={t.color as any} /></div>))}</div></Card>
           </Grid>
        </div>
    );
};
