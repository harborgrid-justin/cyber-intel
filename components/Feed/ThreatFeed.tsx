
import React, { useEffect, useState } from 'react';
import { threatData } from '../../services/dataLayer';
import { Threat } from '../../types';
import FeedItem from './FeedItem';
import IoCManagement from './IoCManagement';
import NetworkGraph from '../Shared/NetworkGraph';
import { StandardPage } from '../Shared/Layouts';
import { CONFIG } from '../../config';
import { EmptyState } from '../Shared/UI';

const ThreatFeed: React.FC = () => {
  const [activeModule, setActiveModule] = useState(CONFIG.MODULES.THREAT_FEED[0]);
  const [allThreats, setAllThreats] = useState<Threat[]>([]);

  useEffect(() => {
    const refresh = () => setAllThreats(threatData.getThreats());
    refresh(); 
    window.addEventListener('data-update', refresh);
    return () => window.removeEventListener('data-update', refresh);
  }, []);

  const getFilteredThreats = () => {
    if (activeModule === 'All Threats' || activeModule === 'Manage IoCs') return allThreats;
    
    return allThreats.filter(t => {
      const content = JSON.stringify(t).toLowerCase();
      // Basic heuristic filtering based on the tab name
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
  };

  const filteredThreats = getFilteredThreats();
  const graphThreats = filteredThreats.slice(0, 8); 

  return (
    <StandardPage
      title="Live Threat Feed"
      subtitle="Real-time Indicator of Compromise (IoC) Stream"
      modules={CONFIG.MODULES.THREAT_FEED}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
    >
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
                <EmptyState message={`No active threats found for ${activeModule}`} />
            )}
          </div>
        </>
      )}
    </StandardPage>
  );
};
export default ThreatFeed;
