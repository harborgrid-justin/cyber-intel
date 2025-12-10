import React from 'react';
// Fix: Import types from the central types file
import { Threat, Case } from '../../../types';
// Fix: Import UI components from the barrel file
import { Card, CardHeader, Badge } from '../../Shared/UI';
import KillChainView from './KillChainView';
import { InteractiveGraph } from '../../Shared/InteractiveGraph';
import FeedItem from '../../Feed/FeedItem';

interface Props {
  activeCase: Case;
  linkedThreats: Threat[];
}

const CaseIntelligenceView: React.FC<Props> = ({ activeCase, linkedThreats }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-6">
            <KillChainView threats={linkedThreats} />
            <Card className="flex-1 p-0 overflow-hidden min-h-[400px] flex flex-col">
                <CardHeader title="Relationship Topology (Live)" />
                <div className="flex-1 bg-slate-950 p-2">
                    <InteractiveGraph threats={linkedThreats} />
                </div>
            </Card>
        </div>
        <Card className="p-0 overflow-hidden flex flex-col h-full max-h-[800px]">
            <CardHeader title="Linked Indicators (IoCs)" action={<Badge color="red">{linkedThreats.length} Items</Badge>} />
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-2 bg-slate-900/30">
                {linkedThreats.length > 0 ? linkedThreats.map(t => <FeedItem key={t.id} threat={t} />) : <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-lg text-slate-500">No threats currently linked to this case.<br/><span className="text-xs">Use "Add Artifact" or link from Feed.</span></div>}
            </div>
        </Card>
    </div>
  );
};
export default CaseIntelligenceView;