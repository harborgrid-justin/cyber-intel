
import React, { useState } from 'react';
import { Threat, IncidentStatus, Severity } from '../../types';
import { threatData } from '../../services/dataLayer';
import { IncidentLogic } from '../../services/logic/IncidentLogic';
import { Button, Badge, Card, CardHeader } from '../Shared/UI';
import ResponsiveTable from '../Shared/ResponsiveTable';
import { useHaptics } from '../../hooks/useHaptics';
import { commandManager, ICommand } from '../../services/commands/CommandManager';
import { Icons } from '../Shared/Icons';

// Command Pattern for Triage Actions
class TriageCommand implements ICommand {
    constructor(private id: string, private oldStatus: IncidentStatus, private newStatus: IncidentStatus) {}
    execute() { threatData.updateStatus(this.id, this.newStatus); }
    undo() { threatData.updateStatus(this.id, this.oldStatus); }
}

// Command for Bulk Actions
class BulkTriageCommand implements ICommand {
    constructor(private commands: TriageCommand[]) {}
    execute() { this.commands.forEach(c => c.execute()); }
    undo() { this.commands.forEach(c => c.undo()); }
}

interface Props { threats: Threat[]; onUpdate: () => void; }

const IncidentTriage: React.FC<Props> = ({ threats, onUpdate }) => {
  const [processing, setProcessing] = useState(false);
  const newThreats = threats.filter(t => t.status === IncidentStatus.NEW);
  const { triggerSuccess, triggerAlert } = useHaptics();

  const handleAction = (id: string, newStatus: IncidentStatus) => {
    const cmd = new TriageCommand(id, IncidentStatus.NEW, newStatus);
    commandManager.execute(cmd);
    onUpdate(); // Trigger re-render to reflect change
    newStatus === IncidentStatus.INVESTIGATING ? triggerSuccess() : triggerAlert();
  };

  const handleDismissAll = () => {
    const commands = newThreats.map(t => new TriageCommand(t.id, IncidentStatus.NEW, IncidentStatus.CLOSED));
    if (commands.length > 0) {
        commandManager.execute(new BulkTriageCommand(commands));
        onUpdate();
        triggerAlert();
    }
  };

  const handleAutoProcess = async () => {
    setProcessing(true);
    const { archived, promoted } = await IncidentLogic.autoTriage(newThreats);
    
    const commands: TriageCommand[] = [
        ...archived.map(id => new TriageCommand(id, IncidentStatus.NEW, IncidentStatus.CLOSED)),
        ...promoted.map(id => new TriageCommand(id, IncidentStatus.NEW, IncidentStatus.INVESTIGATING))
    ];
    
    if (commands.length > 0) {
        commandManager.execute(new BulkTriageCommand(commands));
        onUpdate();
        triggerSuccess();
    }
    
    setProcessing(false);
    window.dispatchEvent(new CustomEvent('notification', { 
        detail: { title: 'AI Triage Complete', message: `${promoted.length} threats promoted, ${archived.length} archived.`, type: 'success' } 
    }));
  };
  
  const getSeverityColor = (severity: Severity) => {
    if (severity === Severity.CRITICAL) return 'red';
    if (severity === Severity.HIGH) return 'orange';
    if (severity === Severity.MEDIUM) return 'yellow';
    return 'blue';
  };

  return (
    <div className="space-y-4">
      <Card className="p-0 overflow-hidden">
        <CardHeader 
          title={`Inbox / Triage (${newThreats.length})`}
          action={
            <div className="flex gap-2">
                <Button onClick={() => { commandManager.undo(); onUpdate(); }} disabled={!commandManager.canUndo()} variant="secondary" className="text-[10px] py-1"><Icons.Refresh className="w-3 h-3 mr-1"/> UNDO</Button>
                <Button onClick={handleAutoProcess} disabled={processing} variant="primary" className="text-[10px] py-1 bg-purple-600 hover:bg-purple-500">
                    {processing ? 'ANALYZING...' : '✨ AI AUTO-TRIAGE'}
                </Button>
                <Button onClick={handleDismissAll} variant="danger" className="text-[10px] py-1">DISMISS ALL</Button>
            </div>
          }
        />
        <div className="p-4 bg-slate-900/50 border-b border-slate-800 text-xs text-slate-400">
            Rules: Low confidence noise is archived. Critical confidence {'>'} 90% is auto-promoted.
        </div>
      </Card>
      
      <ResponsiveTable<Threat>
        data={newThreats}
        keyExtractor={t => t.id}
        columns={[
          { header: 'Severity', render: t => <Badge color={getSeverityColor(t.severity)}>{t.severity}</Badge> },
          { header: 'Confidence', render: t => <div className="font-mono text-sm text-cyan-400">{t.confidence}%</div> },
          { header: 'Indicator', render: t => <div><div className="text-white font-mono font-bold text-sm">{t.indicator}</div><div className="text-xs text-slate-500">{t.type}</div></div> },
          { header: 'Score', render: t => <span className={`font-bold text-lg ${t.score > 80 ? 'text-red-500' : t.score > 60 ? 'text-orange-500' : 'text-slate-300'}`}>{t.score}</span> },
          { header: 'Actions', render: t => (
            <div className="flex gap-2">
              <Button onClick={() => handleAction(t.id, IncidentStatus.INVESTIGATING)} variant="primary" className="py-1 px-2 text-[10px]">Promote</Button>
              <Button onClick={() => handleAction(t.id, IncidentStatus.CLOSED)} variant="text" className="py-1 px-2 text-[10px] text-slate-500 hover:text-red-500">Dismiss</Button>
            </div>
          )}
        ]}
        renderMobileCard={t => (
          <div className="flex justify-between items-center">
             <div><div className="text-white font-mono">{t.indicator}</div><Badge color={getSeverityColor(t.severity)}>{t.severity}</Badge></div>
             <Button onClick={() => handleAction(t.id, IncidentStatus.INVESTIGATING)} variant="primary">Promote</Button>
          </div>
        )}
      />
    </div>
  );
};
export default IncidentTriage;
