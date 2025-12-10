
import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, CardHeader } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';
import PlaybookRunner from './PlaybookRunner';
import { Playbook } from '../../types';
import { useDataStore } from '../../hooks';
import { DetailViewHeader } from '../Shared/Layouts';

interface WorkflowSelectorPageProps {
  onClose: () => void;
  onApply: (playbookId: string) => void;
}

const WorkflowSelectorPage: React.FC<WorkflowSelectorPageProps> = ({ onClose, onApply }) => {
  const playbooks = useDataStore(() => threatData.getPlaybooks());
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Reset state if component is re-rendered (e.g., closed and opened again)
    setIsRunning(false);
    setSelectedPlaybook(null);
  }, []);

  const handleStart = (pb: Playbook) => {
    setSelectedPlaybook(pb);
    setIsRunning(true);
  };

  const handleComplete = () => {
    if (selectedPlaybook) {
      onApply(selectedPlaybook.id);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full relative shadow-2xl animate-in fade-in duration-300">
        <DetailViewHeader 
            title={isRunning ? "Automated Response Protocol" : "Select Response Playbook"}
            subtitle="SOAR Orchestration"
            onBack={onClose}
        />
        <div className="flex-1 p-6 overflow-y-auto">
            {isRunning && selectedPlaybook ? (
                <PlaybookRunner playbook={selectedPlaybook} onComplete={handleComplete} />
            ) : (
                <div className="space-y-4 max-w-2xl mx-auto">
                    {playbooks.map(pb => (
                        <Card key={pb.id} className="p-4 hover:border-cyan-500 transition-colors group cursor-pointer border-l-4 border-l-transparent hover:border-l-cyan-500">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{pb.name}</h4>
                            <Badge color="blue">{pb.tasks.length} Tasks</Badge>
                        </div>
                        <p className="text-xs text-slate-400 mb-4 leading-relaxed">{pb.description}</p>
                        
                        <div className="bg-slate-950 p-3 rounded border border-slate-800 mb-4">
                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">Automated Actions:</div>
                            <div className="flex flex-wrap gap-2">
                                {pb.tasks.slice(0, 4).map(t => (
                                    <span key={t} className="text-[10px] text-slate-300 bg-slate-900 border border-slate-700 px-2 py-1 rounded shadow-sm">
                                    {t}
                                    </span>
                                ))}
                                {pb.tasks.length > 4 && <span className="text-[10px] text-slate-500 flex items-center">+{pb.tasks.length - 4} more</span>}
                            </div>
                        </div>
                        
                        <Button onClick={() => handleStart(pb)} className="w-full" variant="secondary">
                            <span className="mr-2">⚡</span> Deploy Playbook
                        </Button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default WorkflowSelectorPage;
