import React from 'react';
import { useThreatFeedLogic } from '../../hooks/useThreatFeedLogic';
import { Threat } from '../../types';
import { Icons } from '../Shared/Icons';
import { AdvancedSearch } from './AdvancedSearch';
import { FeedFilters } from './FeedFilters';
import ResponsiveTable from '../Shared/ResponsiveTable';
import { Badge, Button, Card, CardHeader } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';

const ThreatFeed: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    query,
    setQuery,
    filteredThreats,
    searchError,
    modules
  } = useThreatFeedLogic();

  // Handlers derived from pure logic where possible, or simple dispatchers
  const handlePromote = (id: string) => {
    threatData.createCaseFromThreat(id);
    window.dispatchEvent(new CustomEvent('notification', { 
        detail: { title: 'Case Created', message: `Threat ${id} promoted to active case.`, type: 'success' } 
    }));
  };

  return (
    <div className="p-4 md:p-6 h-full flex flex-col gap-4">
      <div className="flex flex-col gap-4 shrink-0">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Global Threat Intelligence</h2>
                <p className="text-xs text-slate-400 font-mono">LIVE FEED • {filteredThreats.length} SIGNALS</p>
            </div>
            <div className="flex gap-2">
                {modules.map(m => (
                    <button
                        key={m}
                        onClick={() => setActiveModule(m)}
                        className={`px-3 py-1 text-[10px] uppercase font-bold rounded border transition-colors ${
                            activeModule === m 
                            ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400' 
                            : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                        }`}
                    >
                        {m}
                    </button>
                ))}
            </div>
        </div>

        <AdvancedSearch 
            value={query} 
            onChange={setQuery} 
            error={searchError} 
            placeholder="Search IoCs (e.g. type:Malware AND confidence > 80)..." 
        />
      </div>

      <Card className="flex-1 p-0 overflow-hidden flex flex-col min-h-0 bg-slate-950 border-slate-800">
        <div className="flex-1 overflow-y-auto">
            <ResponsiveTable<Threat>
                data={filteredThreats}
                keyExtractor={t => t.id}
                columns={[
                    { header: 'Severity', render: t => <Badge color={t.severity === 'CRITICAL' ? 'red' : t.severity === 'HIGH' ? 'orange' : 'slate'}>{t.severity}</Badge> },
                    { header: 'Indicator', render: t => <div className="font-mono text-sm text-white font-bold">{t.indicator}<div className="text-[10px] text-slate-500">{t.type}</div></div> },
                    { header: 'Actor', render: t => <span className="text-cyan-400 font-bold text-xs">{t.threatActor}</span> },
                    { header: 'Confidence', render: t => <div className="w-16"><div className="h-1 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-cyan-500" style={{width: `${t.confidence}%`}}></div></div><div className="text-[9px] text-right mt-1">{t.confidence}%</div></div> },
                    { header: 'Actions', render: t => (
                        <div className="flex gap-2 justify-end">
                            <Button onClick={() => handlePromote(t.id)} variant="secondary" className="text-[10px] py-1 h-7">PROMOTE</Button>
                        </div>
                    )}
                ]}
                renderMobileCard={t => (
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-white font-mono font-bold text-sm">{t.indicator}</div>
                            <div className="text-xs text-slate-500">{t.type} • {t.threatActor}</div>
                        </div>
                        <Badge color={t.severity === 'CRITICAL' ? 'red' : 'blue'}>{t.score}</Badge>
                    </div>
                )}
            />
        </div>
      </Card>
    </div>
  );
};

export default ThreatFeed;