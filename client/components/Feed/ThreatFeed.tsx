
import React, { useEffect, useState, useMemo } from 'react';
import { threatData } from '../../services-frontend/dataLayer';
import { Threat, IoCFeed } from '../../types';
import FeedItem from './FeedItem';
import IoCManagement from './IoCManagement';
import NetworkGraph from '../Shared/NetworkGraph';
import { StandardPage } from '../Shared/Layouts';
import { CONFIG } from '../../config';
import { EmptyState, FilterGroup } from '../Shared/UI';

const ThreatFeed: React.FC = () => {
  const [activeModule, setActiveModule] = useState(CONFIG.MODULES.THREAT_FEED[0]);
  const [allThreats, setAllThreats] = useState<Threat[]>([]);
  const [feeds, setFeeds] = useState<IoCFeed[]>([]);
  const [selectedFeedSource, setSelectedFeedSource] = useState<string>('ALL');

  useEffect(() => {
    const refresh = () => {
      setAllThreats(threatData.getThreats());
      setFeeds(threatData.getFeeds());
    };
    refresh(); 
    window.addEventListener('data-update', refresh);
    return () => window.removeEventListener('data-update', refresh);
  }, []);

  const filteredThreats = useMemo(() => {
    if (activeModule === 'Manage IoCs') return allThreats;
    
    let filtered = allThreats;

    if (selectedFeedSource !== 'ALL') {
      filtered = filtered.filter(t => t.source === selectedFeedSource);
    }

    if (activeModule === 'All Threats') return filtered;
    
    return filtered.filter(t => {
      // Perform case-insensitive string check once
      const content = (t.indicator + t.description + t.type + t.threatActor).toLowerCase();
      
      switch(activeModule) {
        case 'APTs': return t.threatActor !== 'Unknown' && t.threatActor !== 'Unattributed';
        case 'Malware': return content.includes('malware') || content.includes('trojan') || content.includes('virus') || t.type === 'File Hash';
        case 'Phishing': return content.includes('phishing') || t.type === 'URL';
        case 'Ransomware': return content.includes('ransomware') || content.includes('encrypt');
        case 'Botnets': return content.includes('botnet') || content.includes('c2') || content.includes('beacon');
        case 'Exploits': return content.includes('exploit') || content.includes('cve') || content.includes('vulnerability');
        case 'Zero-Days': return content.includes('zero-day') || content.includes('0-day');
        case 'Dark Web': return content.includes('dark web') || content.includes('leak') || content.includes('tor');
        default: return true;
      }
    });
  }, [allThreats, activeModule, selectedFeedSource]);

  const graphThreats = useMemo(() => filteredThreats.slice(0, 8), [filteredThreats]);

  return (
    <StandardPage
      title="Live Threat Feed"
      subtitle="Real-time Indicator of Compromise (IoC) Stream"
      modules={CONFIG.MODULES.THREAT_FEED}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
    >
      {/* Feed Status Filter */}
      <FilterGroup
        value={selectedFeedSource}
        onChange={setSelectedFeedSource}
        className="mb-2"
        options={[
          { label: 'ALL SOURCES', value: 'ALL' },
          ...feeds.map(f => ({
            label: f.name,
            value: f.name,
            color: f.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'
          }))
        ]}
      />

      {activeModule === 'Manage IoCs' ? (
        <IoCManagement />
      ) : (
        <>
          {filteredThreats.length > 0 && (
            <div className="mb-6">
              <NetworkGraph threats={graphThreats} />
            </div>
          )}

          <div className="hidden md:flex bg-slate-900/50 p-2 rounded-sm border border-slate-800 mb-2 justify-between text-xs text-slate-500 font-mono uppercase tracking-widest px-4">
            <span>Indicator / Description ({activeModule})</span>
            <span>Priority Score</span>
          </div>

          <div className="space-y-3">
            {filteredThreats.length > 0 ? (
                filteredThreats.map((threat) => (
                <FeedItem key={threat.id} threat={threat} />
                ))
            ) : (
                <EmptyState message={`No active threats found for ${activeModule} from ${selectedFeedSource === 'ALL' ? 'any source' : selectedFeedSource}`} />
            )}
          </div>
        </>
      )}
    </StandardPage>
  );
};
export default ThreatFeed;
