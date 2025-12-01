
import React, { useState, useEffect } from 'react';
import { threatData } from '../../services/dataLayer';
import { Threat, Severity, IncidentStatus } from '../../types';
import ResponsiveTable from '../Shared/ResponsiveTable';
import { Input, Button, Card, Select, CardHeader } from '../Shared/UI';

const IOC_TYPES = [
  'IP Address', 'Domain', 'File Hash', 'URL', 'Email Address', 'File Path', 'Registry Key', 'Manual'
];

const IoCManagement: React.FC = () => {
  const [data, setData] = useState(threatData.getThreats());
  const [newIoC, setNewIoC] = useState('');
  const [newType, setNewType] = useState(IOC_TYPES[0]);

  useEffect(() => {
    const refresh = () => setData(threatData.getThreats());
    window.addEventListener('data-update', refresh);
    return () => window.removeEventListener('data-update', refresh);
  }, []);

  const handleDelete = (id: string) => { threatData.deleteThreat(id); };

  const handleAdd = () => {
    if (!newIoC) return;
    const t: Threat = {
      id: Date.now().toString(), indicator: newIoC, type: newType, severity: Severity.MEDIUM,
      lastSeen: 'Now', source: 'Analyst', description: 'Manual Entry', status: IncidentStatus.NEW,
      confidence: 100, region: 'Internal', threatActor: 'Unknown', reputation: 0, score: 50
    };
    threatData.addThreat(t);
    setNewIoC('');
  };

  return (
    <div className="space-y-6">
      <Card className="p-0 overflow-hidden">
        <CardHeader title="Quick Add Indicator" />
        <div className="p-4 flex flex-col md:flex-row gap-4 bg-slate-900/50">
          <Select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="w-full md:w-48"
          >
            {IOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Input 
            value={newIoC} onChange={e => setNewIoC(e.target.value)} 
            placeholder="Enter Indicator..." 
            className="flex-1" 
          />
          <Button onClick={handleAdd} variant="primary" className="whitespace-nowrap">ADD IOC</Button>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <CardHeader title="Indicator Database" />
        <ResponsiveTable<Threat> 
          data={data}
          keyExtractor={i => i.id}
          columns={[
            { header: 'Indicator', render: i => <span className="text-white font-mono">{i.indicator}</span> },
            { header: 'Type', render: i => <span className="text-xs text-slate-400">{i.type}</span> },
            { header: 'Action', render: i => <Button onClick={() => handleDelete(i.id)} variant="danger" className="py-1 px-2 text-xs">DELETE</Button> }
          ]}
          renderMobileCard={i => (
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-mono font-bold">{i.indicator}</div>
                <div className="text-xs text-slate-500">{i.type}</div>
              </div>
              <Button onClick={() => handleDelete(i.id)} variant="danger" className="py-1 px-2 text-xs">DELETE</Button>
            </div>
          )}
        />
      </Card>
    </div>
  );
};
export default IoCManagement;
