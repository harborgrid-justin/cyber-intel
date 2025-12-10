
import React, { useState, useEffect, useMemo } from 'react';
// Fix: Consolidate type imports to use the central `types.ts` file.
import { Threat, Severity, IncidentStatus, ThreatId } from '../../types';
import { threatData } from '../../services/dataLayer';
import ResponsiveTable from '../Shared/ResponsiveTable';
import { Input, Button, Select } from '../Shared/UI';
// Fix: Import Card and CardHeader from the correct central UI export
import { Card, CardHeader } from '../Shared/UI';
import { BloomFilter } from '../../services/algorithms/BloomFilter';

const IOC_TYPES = ['IP Address', 'Domain', 'File Hash', 'URL', 'Email Address'];
const filter = new BloomFilter(1000, 0.01);

const IoCManagement: React.FC = () => {
  const [data, setData] = useState(threatData.getThreats());
  const [newIoC, setNewIoC] = useState('');
  const [newType, setNewType] = useState(IOC_TYPES[0]);

  useEffect(() => {
    const refresh = () => { const threats = threatData.getThreats(); threats.forEach(t => filter.add(t.indicator)); setData(threats); };
    refresh();
    window.addEventListener('data-update', refresh);
    return () => window.removeEventListener('data-update', refresh);
  }, []);

  const handleDelete = (id: string) => { threatData.deleteThreat(id); };

  const handleAdd = () => {
    if (!newIoC) return;
    if (filter.test(newIoC)) { if (!confirm(`Possible Duplicate. Add anyway?`)) return; }
    const t: Threat = {
      id: Date.now().toString() as ThreatId, indicator: newIoC, type: newType, severity: Severity.MEDIUM, lastSeen: 'Now',
      source: 'Analyst', description: 'Manual Entry', status: IncidentStatus.NEW, confidence: 100, region: 'Internal',
      threatActor: 'Unknown', reputation: 0, score: 50
    };
    threatData.addThreat(t);
    filter.add(newIoC);
    setNewIoC('');
  };

  return (
    <div className="space-y-6">
      <Card className="p-0 overflow-hidden">
        <CardHeader title="Quick Add Indicator" />
        <div className="p-4 flex flex-col md:flex-row gap-4 bg-slate-900/50">
          <Select value={newType} onChange={(e) => setNewType(e.target.value)} className="w-full md:w-48">{IOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</Select>
          <Input value={newIoC} onChange={e => setNewIoC(e.target.value)} placeholder="Enter Indicator..." className="flex-1" />
          <Button onClick={handleAdd} variant="primary">ADD IOC</Button>
        </div>
      </Card>
      <Card className="p-0 overflow-hidden">
        <CardHeader title="Indicator Database" />
        <ResponsiveTable<Threat> data={data} keyExtractor={i => i.id} columns={[ { header: 'Indicator', render: i => <span className="text-white font-mono">{i.indicator}</span> }, { header: 'Type', render: i => <span className="text-xs text-slate-400">{i.type}</span> }, { header: 'Action', render: i => <Button onClick={() => handleDelete(i.id)} variant="danger" className="py-1 px-2 text-xs">DELETE</Button> } ]} renderMobileCard={i => <div>{i.indicator}</div>} />
      </Card>
    </div>
  );
};
export default IoCManagement;
    