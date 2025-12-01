
import React from 'react';
import { Campaign, Threat, View } from '../../types';
import SubModuleNav from '../Shared/SubModuleNav';
import { DetailViewHeader } from '../Shared/Layouts';
import { Button, Card, Badge } from '../Shared/UI';
import { CampaignOverview, CampaignIoCs, CampaignTimeline, CampaignAttribution } from './CampaignViews';
import CampaignImpact from './Views/CampaignImpact';
import { threatData } from '../../services/dataLayer';

interface CampaignDetailProps {
  campaign: Campaign; activeModule: string; onModuleChange: (m: string) => void;
  onBack: () => void; modules: string[]; onUpdate: () => void;
}

const CampaignDetail: React.FC<CampaignDetailProps> = ({ campaign, activeModule, onModuleChange, onBack, modules, onUpdate }) => {
  const linkedThreats = threatData.getThreats().filter(t => campaign.threatIds.includes(t.id));

  const handleDelete = () => {
    threatData.deleteCampaign(campaign.id);
    onUpdate();
    onBack();
  };

  return (
    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full">
      <DetailViewHeader 
        title={campaign.name} 
        subtitle={campaign.id} 
        onBack={onBack} 
        tags={<><Badge color={campaign.status === 'ACTIVE' ? 'red' : 'slate'}>{campaign.status}</Badge><Badge color="blue">{campaign.objective}</Badge></>}
        actions={<Button onClick={handleDelete} variant="danger" className="text-[10px] py-1">DELETE</Button>} 
      />
      <SubModuleNav modules={modules} activeModule={activeModule} onChange={onModuleChange} />
      
      <div className="p-6 flex-1 overflow-y-auto">
        {activeModule === 'Overview' && <CampaignOverview campaign={campaign} />}
        {activeModule === 'Strategic Impact' && <CampaignImpact campaign={campaign} />}
        {activeModule === 'IOCs' && <CampaignIoCs threats={linkedThreats} />}
        {activeModule === 'Attribution' && <CampaignAttribution actors={campaign.actors} />}
        {activeModule === 'Timeline' && <CampaignTimeline campaign={campaign} />}
        {activeModule === 'TTP Matrix' && (
           <div className="space-y-4">
             <div className="flex justify-between items-center"><h3 className="text-white font-bold">ATT&CK Alignment</h3><Badge color="purple">{campaign.ttps.length} Techniques</Badge></div>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {campaign.ttps.map(ttp => (
                   <Card 
                        key={ttp} 
                        className="p-3 bg-slate-900 border border-slate-700 hover:border-cyan-500 cursor-pointer group"
                        onClick={() => window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view: View.MITRE } }))}
                   >
                      <div className="text-xs text-cyan-500 font-mono font-bold mb-1 group-hover:text-cyan-300">{ttp}</div>
                      <div className="text-[10px] text-slate-400">Technique ID</div>
                   </Card>
                ))}
             </div>
           </div>
        )}
      </div>
    </div>
  );
};
export default CampaignDetail;
