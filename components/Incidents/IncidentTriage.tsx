
import React from 'react';
import { Threat, IncidentStatus, Severity } from '../../types';
import { threatData } from '../../services/dataLayer';
import { Button, Badge, Card } from '../Shared/UI';
import ResponsiveTable from '../Shared/ResponsiveTable';

interface Props { threats: Threat[]; onUpdate: () => void; }

const IncidentTriage: React.FC<Props> = ({ threats, onUpdate }) => {
  const newThreats = threats.filter(t => t.status === IncidentStatus.NEW);

  const handlePromote = (t: Threat) => {
    threatData.updateStatus(t.id, IncidentStatus.INVESTIGATING);
    onUpdate();
  };

  const handleDismiss = (id: string) => {
    threatData.updateStatus(id, IncidentStatus.CLOSED);
    onUpdate();
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 flex justify-between items-center">
        <div>
          <h3 className="text-white font-bold">Inbox / Triage</h3>
          <p className="text-xs text-slate-500">{newThreats.length} items requiring attention</p>
        </div>
        <Button onClick={() => newThreats.forEach(t => handleDismiss(t.id))} variant="secondary">Clear All</Button>
      </Card>
      
      <ResponsiveTable<Threat>
        data={newThreats}
        keyExtractor={t => t.id}
        columns={[
          { header: 'Severity', render: t => <Badge color={t.severity === Severity.CRITICAL ? 'red' : 'yellow'}>{t.severity}</Badge> },
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
