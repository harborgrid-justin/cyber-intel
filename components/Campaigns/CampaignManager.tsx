
import React, { useState, useEffect, useMemo } from 'react';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';
import { Campaign, View } from '../../types';
import CampaignList from './CampaignList';
import CampaignDetail from './CampaignDetail';
import { MasterDetailLayout } from '../Shared/Layouts';
import { Button, Input, Card } from '../Shared/UI';

interface CampaignManagerProps {
  initialId?: string;
}

const CampaignManager: React.FC<CampaignManagerProps> = ({ initialId }) => {
  const modules = useMemo(() => threatData.getModulesForView(View.CAMPAIGNS), []);
  const [campModule, setCampModule] = useState(modules[0]);
  const [activeDetailModule, setActiveDetailModule] = useState(threatData.getModulesForView(View.CAMPAIGNS)[0]);
  
  // Efficient subscription
  const campaigns = useDataStore(() => threatData.getCampaigns());
  
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (initialId) {
      const found = campaigns.find(c => c.id === initialId);
      if (found) setSelectedCampaign(found);
    }
  }, [initialId, campaigns]);

  const handleCreate = () => {
    if(!newName) return;
    const newCamp: Campaign = {
        id: `CAM-${Date.now()}`, name: newName, description: 'New campaign entry.', status: 'ACTIVE', objective: 'UNKNOWN',
        actors: [], firstSeen: new Date().toISOString().split('T')[0], lastSeen: new Date().toISOString().split('T')[0],
        targetSectors: [], targetRegions: [], threatIds: [], ttps: []
    };
    threatData.addCampaign(newCamp);
    setNewName('');
    setIsCreating(false);
    setSelectedCampaign(newCamp);
  };

  const getFilteredCampaigns = () => {
    if (campModule === 'Archived') return campaigns.filter(c => c.status === 'ARCHIVED');
    if (campModule === 'Active Campaigns') return campaigns.filter(c => c.status === 'ACTIVE' || c.status === 'DORMANT');
    return campaigns;
  };

  const filteredCampaigns = getFilteredCampaigns();

  return (
    <MasterDetailLayout
      title="Campaign Management"
      subtitle="Strategic Threat Correlation"
      modules={modules}
      activeModule={campModule}
      onModuleChange={setCampModule}
      isDetailOpen={!!selectedCampaign || isCreating}
      onBack={() => { setSelectedCampaign(null); setIsCreating(false); }}
      listContent={
        <>
          <Button onClick={() => { setIsCreating(true); setSelectedCampaign(null); }} className="w-full mb-4">+ NEW CAMPAIGN</Button>
          <CampaignList campaigns={filteredCampaigns} selectedId={selectedCampaign?.id || null} onSelect={(c) => { setSelectedCampaign(c); setIsCreating(false); }} />
        </>
      }
      detailContent={
        isCreating ? (
           <Card className="p-6 m-4">
              <h2 className="text-xl font-bold text-white mb-4">Initialize Campaign Tracking</h2>
              <div className="space-y-4 max-w-lg">
                 <div><label className="text-xs font-bold text-slate-500 uppercase">Campaign Name</label><Input value={newName} onChange={e => setNewName(e.target.value)} className="mt-1" /></div>
                 <div className="flex gap-4"><Button onClick={handleCreate}>INITIALIZE</Button><Button onClick={() => setIsCreating(false)} variant="secondary">CANCEL</Button></div>
              </div>
           </Card>
        ) : selectedCampaign ? (
          <CampaignDetail 
            campaign={selectedCampaign} 
            activeModule={activeDetailModule} 
            onModuleChange={setActiveDetailModule} 
            onBack={() => setSelectedCampaign(null)} 
            modules={threatData.getModulesForView(View.CAMPAIGNS)} 
            onUpdate={() => {}} 
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 border border-slate-800 rounded-xl bg-slate-900 m-4 uppercase tracking-widest">Select a campaign</div>
        )
      }
    />
  );
};
export default CampaignManager;
