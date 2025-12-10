
import React from 'react';
import { useOrchestrator } from '../../hooks/modules/useOrchestrator';
import { StandardPage } from '../Shared/Layouts';
import { ResponseTopology } from './Views/ResponseTopology';
import { DeceptionOps } from './Views/DeceptionOps';
import { PatchStrategy } from './Views/PatchStrategy';
import { SegmentationView } from './Views/SegmentationView';
import { WidgetErrorBoundary } from '../Shared/WidgetErrorBoundary';

const MODULES = ['Response Topology', 'Deception Ops', 'Segmentation', 'Patch Strategy'];

const Orchestrator: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedNodeId,
    setSelectedNodeId,
    generatedPlan,
    setGeneratedPlan,
    isSimulating,
    handleSimulate,
    handleExecute,
    prioritizedPatches,
    nodes,
    playbooks,
    threats,
    honeytokens
  } = useOrchestrator();

  const activeThreats = threats.filter(t => t.status !== 'CLOSED');

  return (
    <StandardPage 
        title="Active Defense Orchestrator" 
        subtitle="SOAR & Defensive Operations" 
        modules={MODULES} 
        activeModule={activeTab} 
        onModuleChange={setActiveTab}
    >
        <div className="flex-1 min-h-0 lg:overflow-hidden">
           <WidgetErrorBoundary title={activeTab}>
             {activeTab === 'Response Topology' && (
               <ResponseTopology 
                  nodes={nodes}
                  activeThreats={activeThreats}
                  selectedNodeId={selectedNodeId} 
                  onSelectNode={(id) => { setSelectedNodeId(id); setGeneratedPlan(null); }}
                  generatedPlan={generatedPlan}
                  playbooks={playbooks}
                  onSimulate={handleSimulate}
                  onExecute={handleExecute}
                  onReset={() => setGeneratedPlan(null)}
               />
             )}

             {activeTab === 'Deception Ops' && <DeceptionOps honeytokens={honeytokens} />}

             {activeTab === 'Segmentation' && <SegmentationView />}

             {activeTab === 'Patch Strategy' && <PatchStrategy prioritizedPatches={prioritizedPatches} />}
           </WidgetErrorBoundary>
        </div>
    </StandardPage>
  );
};
export default Orchestrator;
