
import React from 'react';
import FeedItem from './FeedItem';
import IoCManagement from './IoCManagement';
import NetworkGraph from '../Shared/NetworkGraph';
import { StandardPage } from '../Shared/Layouts';
import { EmptyState } from '../Shared/ui/EmptyState';
import { AdvancedSearch } from './AdvancedSearch';
import { useThreatFeedLogic } from '../../hooks/useThreatFeedLogic';

const ThreatFeed: React.FC = () => {
  const {
    modules,
    activeModule,
    setActiveModule,
    query,
    setQuery,
    filteredThreats,
    graphThreats,
    searchError
  } = useThreatFeedLogic();

  return (
    <StandardPage 
        title="Live Threat Feed" 
        subtitle="Real-time Indicator of Compromise (IoC) Stream" 
        modules={modules} 
        activeModule={activeModule} 
        onModuleChange={setActiveModule}
    >
      <div className="shrink-0 mb-4 space-y-4">
        <AdvancedSearch 
            value={query} 
            onChange={setQuery} 
            error={searchError} 
            placeholder="TQL Query... (e.g. region:APAC AND confidence > 90)" 
        />
      </div>
      
      {activeModule === 'Manage IoCs' ? ( <IoCManagement /> ) : (
        <div className="flex-1 min-h-0 flex flex-col">
          {filteredThreats.length > 0 && (
             <div className="mb-6 shrink-0">
                <NetworkGraph threats={graphThreats} />
             </div>
          )}
          
          <div className="hidden md:flex bg-slate-900/50 p-2 rounded-sm border border-slate-800 mb-2 justify-between text-xs text-slate-500 font-mono uppercase tracking-widest px-4 shrink-0">
              <span>Indicator / Description ({filteredThreats.length} Matches)</span>
              <span>Priority Score</span>
          </div>
          
          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pb-6">
            {filteredThreats.length > 0 ? ( 
                filteredThreats.map((threat) => <FeedItem key={threat.id} threat={threat} />) 
            ) : ( 
                <EmptyState message={`No threats match query: ${query || 'None'}`} /> 
            )}
          </div>
        </div>
      )}
    </StandardPage>
  );
};

export default ThreatFeed;
