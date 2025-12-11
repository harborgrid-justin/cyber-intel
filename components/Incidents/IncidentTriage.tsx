
import React, { useState } from 'react';
import { Threat, IncidentStatus, Severity } from '../../types';
import { threatData } from '../../services/dataLayer';
import { IncidentLogic } from '../../services/logic/IncidentLogic';
import { Button, Badge, Card, CardHeader } from '../Shared/UI';
import ResponsiveTable from '../Shared/ResponsiveTable';
import { useHaptics } from '../../hooks/useHaptics';

interface Props { threats: Threat[]; onUpdate: () => void; }

const IncidentTriage: React.FC<Props> = ({ threats, onUpdate }) => {
  const [processing, setProcessing] = useState(false);
  const newThreats = threats.filter(t => t.status === IncidentStatus.NEW);
  const { triggerSuccess, triggerAlert } = useHaptics();

  const handleAutoProcess = async () => {
    setProcessing(true);
    const { archived, promoted } = await IncidentLogic.autoTriage(newThreats);
    archived.forEach(id => threatData.updateStatus(id, IncidentStatus.CLOSED));
    promoted.forEach(id => threatData.updateStatus(id, IncidentStatus.INVESTIGATING));
    onUpdate();
    setProcessing(false);
    triggerSuccess();
    alert(`Auto-Process: ${promoted.length} Promoted, ${archived.length} Archived`);
  };

  const handlePromote = (t: Threat) => {
    threatData.updateStatus(t.id, IncidentStatus.INVESTIGATING);
    triggerSuccess(); // Haptic feedback
    onUpdate();
  };

  const handleDismiss = (id: string) => {
    threatData.updateStatus(id, IncidentStatus.CLOSED);
    triggerAlert(); // Haptic feedback
    onUpdate();
  };

  return (
    <div className="space-y-4">
      <Card className="p-0 overflow-hidden">
        <CardHeader 
          title={`Inbox / Triage (${newThreats.length})`}
          action={
            <div className="flex gap-2">
                <Button onClick={handleAutoProcess} disabled={processing} variant="primary" className="text-[10px] py-1 bg-purple-600 hover:bg-purple-500">
                    {processing ? 'ANALYZING...' : '✨ AI AUTO-TRIAGE'}
                </Button>
                <Button onClick={() => newThreats.forEach(t => handleDismiss(t.id))} variant="secondary" className="text-[10px] py-1">DISMISS ALL</Button>
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
          { header: 'Severity', render: t => <Badge color={t.severity === Severity.CRITICAL ? 'red' : t.severity === 'HIGH' ? 'orange' : 'yellow'}>{t.severity}</Badge> },
          { header: 'Confidence', render: t => <div className="font-mono text-xs">{t.confidence}%</div> },
          { header: 'Indicator', render: t => <div className="text-white font-mono text-sm">{t.indicator}<div className="text-xs text-slate-500">{t.type}</div></div> },
          { header: 'Score', render: t => <span className={`font-bold ${t.score > 80 ? 'text-red-500' : 'text-slate-300'}`}>{t.score}</span> },
          { header: 'Actions', render: t => (
            <div className="flex gap-2">
              <Button onClick={() => handlePromote(t)} variant="primary" className="py-1 px-2 text-[10px]">Promote</Button>
              <Button onClick={() => handleDismiss(t.id)} variant="text" className="py-1 px-2 text-[10px] text-slate-500">Dismiss</Button>
            </div>
          )}
        ]}
        renderMobileCard={t => (
          <div className="flex justify-between items-center">
             <div><div className="text-white font-mono">{t.indicator}</div><Badge color="red">{t.severity}</Badge></div>
             <Button onClick={() => handlePromote(t)} variant="primary">Promote</Button>
          </div>
        )}
      />
    </div>
  );
};
export default IncidentTriage;
