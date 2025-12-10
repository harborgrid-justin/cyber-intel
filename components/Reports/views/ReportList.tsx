
import React from 'react';
// Fix: Import types from the central types file
import { IncidentReport } from '../../../types';
import { Input, Button, Badge, FilterGroup } from '../../Shared/UI';
import { SectionHeader } from '../../Shared/UI';
import { Icons } from '../../Shared/Icons';

interface Props {
  reports: IncidentReport[];
  filteredReports: IncidentReport[];
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  selectedReportId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
}

export const ReportList: React.FC<Props> = ({ reports, filteredReports, searchTerm, setSearchTerm, statusFilter, setStatusFilter, selectedReportId, onSelect, onCreate }) => {
  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden min-h-0">
        <div className="shrink-0 bg-slate-950 border-b border-slate-800">
            <SectionHeader title="Intelligence Products" action={<Badge>{reports.length}</Badge>} />
            <div className="p-3 space-y-2">
                <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search archives..." className="text-xs" />
                <FilterGroup value={statusFilter} onChange={setStatusFilter} options={[ { label: 'All', value: 'ALL' }, { label: 'Draft', value: 'DRAFT', color: 'bg-yellow-500' }, { label: 'Ready', value: 'READY', color: 'bg-green-500' }, { label: 'Archived', value: 'ARCHIVED', color: 'bg-slate-500' } ]} />
                <Button onClick={onCreate} className="w-full text-xs py-2 mt-2">+ NEW REPORT</Button>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
            {filteredReports.map(r => (
                <div key={r.id} onClick={() => onSelect(r.id)} className={`p-4 border-b border-slate-800 cursor-pointer transition-colors group ${selectedReportId === r.id ? 'bg-slate-800/80 border-l-4 border-l-cyan-500' : 'hover:bg-slate-800/40 border-l-4 border-l-transparent'}`}>
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-[10px] font-mono font-bold truncate ${selectedReportId === r.id ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-400'}`}>{r.id}</span>
                        <Badge color={r.status === 'READY' ? 'green' : r.status === 'DRAFT' ? 'yellow' : 'slate'}>{r.status}</Badge>
                    </div>
                    <h4 className={`font-bold text-sm mb-1 line-clamp-2 ${selectedReportId === r.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{r.title}</h4>
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <span className="flex items-center gap-1 truncate"><Icons.FileText className="w-3 h-3" /> {r.type}</span>
                        <span className="whitespace-nowrap ml-2">{r.date}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
    