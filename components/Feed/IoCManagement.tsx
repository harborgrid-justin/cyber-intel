
import React from 'react';
import { Threat } from '../../types';
import ResponsiveTable from '../Shared/ResponsiveTable';
import { Input, Button, Select } from '../Shared/UI';
import { Card, CardHeader } from '../Shared/UI';
import { useIoCManagement } from '../../hooks/modules/useIoCManagement';

const IoCManagement: React.FC = () => {
  const {
    data, IOC_TYPES,
    newIoC, setNewIoC,
    newType, setNewType,
    handleDelete, handleAdd
  } = useIoCManagement();

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
