
import React, { useState } from 'react';
import { Case, CaseId } from '../../types';
import { Input, Select, TextArea, Button, Label, CardHeader } from '../Shared/UI';

interface Props { onCancel: () => void; onSubmit: (c: Case) => void; }

const CreateCaseForm: React.FC<Props> = ({ onCancel, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  const handleSubmit = () => {
    if(!title) return;
    const newCase: Case = {
      id: `CASE-${Date.now()}` as CaseId, title, description: desc, status: 'OPEN',
      // FIX: Changed 'reporter' to 'createdBy' to match the Case type definition.
      priority: priority as any, assignee: 'Me', createdBy: 'Analyst', tasks: [], findings: '', 
      relatedThreatIds: [], created: new Date().toLocaleDateString(), notes: [], artifacts: [], timeline: [],
      agency: 'SENTINEL_CORE', sharingScope: 'INTERNAL', sharedWith: [], labels: [], tlp: 'AMBER'
    };
    onSubmit(newCase);
  };

  return (
    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
      <CardHeader title="Initialize New Case" />
      <div className="p-6 space-y-6 max-w-lg">
        <div>
          <Label>Case Title</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Operation Name or Incident ID" />
        </div>
        <div>
          <Label>Priority Assessment</Label>
          <Select value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </Select>
        </div>
        <div>
          <Label>Incident Description</Label>
          <TextArea className="h-32" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Detailed summary of the incident..." />
        </div>
        <div className="flex gap-4 pt-4">
          <Button onClick={handleSubmit} className="flex-1">CREATE CASE</Button>
          <Button onClick={onCancel} variant="text" className="flex-1 text-slate-400">CANCEL</Button>
        </div>
      </div>
    </div>
  );
};
export default CreateCaseForm;
