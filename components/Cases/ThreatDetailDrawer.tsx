
import React from 'react';
import { Threat } from '../../types';
import { Drawer } from '../Shared/Drawer';
import { DataField, Badge } from '../Shared/UI';
import { SeverityBadge } from '../Shared/SeverityBadge';

interface Props {
  threat: Threat | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ThreatDetailDrawer: React.FC<Props> = ({ threat, isOpen, onClose }) => {
  if (!threat) return null;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Threat Dossier">
      <div className="space-y-6">
        <div>
            <SeverityBadge level={threat.severity} className="text-xs mb-2" />
            <h2 className="text-xl font-bold text-white font-mono">{threat.indicator}</h2>
            <p className="text-sm text-slate-400">{threat.type}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-xs">
            <DataField label="Risk Score" value={threat.score} />
            <DataField label="Confidence" value={`${threat.confidence}%`} />
            <DataField label="Reputation" value={threat.reputation} />
            <DataField label="Region" value={threat.region} />
        </div>
        
        <div className="space-y-3">
            <DataField label="Description" value={threat.description} />
            <DataField label="Source" value={threat.source} />
            <DataField label="Attributed Actor" value={<Badge color="red">{threat.threatActor}</Badge>} />
            <DataField label="Last Seen" value={threat.lastSeen} />
        </div>
      </div>
    </Drawer>
  );
};
