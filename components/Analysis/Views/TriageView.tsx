
import React from 'react';
import { Card, CardHeader, Button, Badge } from '../../Shared/UI';
import { threatData } from '../../../services/dataLayer';
import { useDataStore } from '../../../hooks/useDataStore';
import ResponsiveTable from '../../Shared/ResponsiveTable';
import { Threat, IncidentStatus } from '../../../types';
import { commandManager, ICommand } from '../../../services/commands/CommandManager';
import { Icons } from '../../Shared/Icons';

class TriageCommand implements ICommand {
    constructor(private id: string, private oldStatus: IncidentStatus, private newStatus: IncidentStatus) {}
    execute() { threatData.updateStatus(this.id, this.newStatus); }
    undo() { threatData.updateStatus(this.id, this.oldStatus); }
}

export const TriageView: React.FC = () => {
  const threats = useDataStore(() => threatData.getThreats());
  const pending = threats.filter(t => t.status === IncidentStatus.NEW);

  const handleAction = (id: string, action: 'PROMOTE' | 'ARCHIVE') => {
    const cmd = new TriageCommand(
        id, 
        IncidentStatus.NEW, 
        action === 'PROMOTE' ? IncidentStatus.INVESTIGATING : IncidentStatus.CLOSED
    );
    commandManager.execute(cmd);
    // Force re-render to update Undo state
    window.dispatchEvent(new Event('data-update'));
  };

  return (
    <Card className="flex flex-col h-full p-0 overflow-hidden">
        <CardHeader 
            title="Intelligence Triage Queue" 
            action={
                <div className="flex items-center gap-2">
                    <Badge color="blue">{pending.length} Pending</Badge>
                    <Button 
                        onClick={() => { commandManager.undo(); window.dispatchEvent(new Event('data-update')); }} 
                        disabled={!commandManager.canUndo()} 
                        variant="secondary" 
                        className="text-[10px] py-1"
                    >
                        <Icons.Refresh className="w-3 h-3 mr-1" /> UNDO
                    </Button>
                </div>
            } 
        />
        <div className="flex-1 overflow-y-auto">
            <ResponsiveTable<Threat> 
                data={pending}
                keyExtractor={t => t.id}
                columns={[
                    { header: 'Severity', render: t => <Badge color={t.severity === 'CRITICAL' ? 'red' : 'yellow'}>{t.severity}</Badge> },
                    { header: 'Indicator', render: t => <span className="font-mono text-white text-xs">{t.indicator}</span> },
                    { header: 'Confidence', render: t => <span className="font-bold text-cyan-500">{t.confidence}%</span> },
                    { header: 'Actions', render: t => (
                        <div className="flex gap-2">
                            <Button onClick={() => handleAction(t.id, 'PROMOTE')} variant="text" className="text-green-500 text-[10px]">ACCEPT</Button>
                            <Button onClick={() => handleAction(t.id, 'ARCHIVE')} variant="text" className="text-red-500 text-[10px]">REJECT</Button>
                        </div>
                    )}
                ]}
                renderMobileCard={t => <div>{t.indicator}</div>}
            />
        </div>
    </Card>
  );
};
