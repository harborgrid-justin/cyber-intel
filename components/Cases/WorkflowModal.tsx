
import React, { useState, useEffect } from 'react';
import Modal from '../Shared/Modal';
import { Button, Card, Badge } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';
import PlaybookRunner from './PlaybookRunner';
import { Playbook } from '../../types';

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (playbookId: string) => void;
}

const WorkflowModal: React.FC<WorkflowModalProps> = ({ isOpen, onClose, onApply }) => {
  const playbooks = threatData.getPlaybooks();
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsRunning(false);
      setSelectedPlaybook(null);
    }
  }, [isOpen]);

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
    <Modal isOpen={isOpen} onClose={onClose} title={isRunning ? "Automated Response Protocol" : "Select Response Playbook"}>
      {isRunning && selectedPlaybook ? (
        <PlaybookRunner playbook={selectedPlaybook} onComplete={handleComplete} />
      ) : (
        <div className="space-y-4">
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
    </Modal>
  );
};
export default WorkflowModal;
