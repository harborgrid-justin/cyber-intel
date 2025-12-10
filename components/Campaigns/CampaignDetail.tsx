import React, { useState, useMemo } from 'react';
import { Campaign, View, Threat } from '../../types';
import SubModuleNav from '../Shared/SubModuleNav';
import { DetailViewHeader } from '../Shared/Layouts';
import { Button, Card, Badge } from '../Shared/UI';
import { CampaignBriefingView, CampaignTechnicalView, CampaignTimeline, CampaignAttribution } from './CampaignViews';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';

interface CampaignDetailProps {
  campaign: Campaign; 
  activeModule: string; 
  onModuleChange: (m: string) => void;
  onBack: () => void; 
  modules: string[]; 
  onUpdate: () => void;
}

const CONSOLIDATED_TABS = ['Mission Brief', 'Technical Ops', 'Timeline', 'Attribution'];

const CampaignDetail: React.FC<CampaignDetailProps> = ({ campaign, onBack, onUpdate }) => {
  const [activeTab, setActiveTab] = useState(CONSOLIDATED_TABS[0]);
  const allThreats = useDataStore(() => threatData.getThreats());
  const linkedThreats = useMemo(() => allThreats.filter(t => campaign.threatIds.includes(t.id)), [allThreats, campaign.threatIds]);

  const handleDelete = () => {
    threatData.deleteCampaign(campaign.id);
    onUpdate();
    onBack();
  };

  const StatusTag = () => (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${
      campaign.status === 'ACTIVE' 
        ? 'bg-red-900/30 text-red-400 border-red-900/50' 
        : 'bg-slate-800 text-slate-400 border-slate-700'
    }`}>
      {campaign.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
      {campaign.status}
    </div>
  );

  return (
    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-2xl">
      <DetailViewHeader 
        title={campaign.name} 
        subtitle={`CAMPAIGN ID: ${campaign.id} • ${campaign.objective}`} 
        onBack={onBack} 
        tags={<><StatusTag /><Badge color="blue">{campaign.objective}</Badge></>}
        actions={<Button onClick={handleDelete} variant="danger" className="text-[10px] py-1 border-red-900/50 hover:bg-red-900/20">DELETE CAMPAIGN</Button>} 
      />
      
      <SubModuleNav 
        modules={CONSOLIDATED_TABS} 
        activeModule={activeTab} 
        onChange={setActiveTab} 
      />
      
      <div className="p-4 md:p-6 flex-1 overflow-y-auto bg-slate-900/30 scroll-smooth">
        <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'Mission Brief' && <CampaignBriefingView campaign={campaign} />}
            
            {activeTab === 'Technical Ops' && <CampaignTechnicalView campaign={campaign} threats={linkedThreats} />}
            
            {activeTab === 'Timeline' && <CampaignTimeline campaign={campaign} />}
            
            {activeTab === 'Attribution' && <CampaignAttribution actors={campaign.actors} />}
        </div>
      </div>
    </div>
  );
};
export default CampaignDetail;