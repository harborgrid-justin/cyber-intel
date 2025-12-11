
import React, { useState } from 'react';
import { Case, CaseId } from '../../types';
import { Input, Select, TextArea, Button, Label, CardHeader } from '../Shared/UI';
import { Logger } from '../../services/logger';

interface Props { onCancel: () => void; onSubmit: (c: Case) => void; }

const CreateCaseForm: React.FC<Props> = ({ onCancel, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Security: Input Sanitization & Validation
  const validate = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Sanitize: Remove dangerous characters (Basic XSS prevention)
    const safeTitle = title.replace(/[<>]/g, '');
    const safeDesc = desc.replace(/[<>]/g, '');

    if (!safeTitle || safeTitle.length < 5) {
        newErrors.title = 'Title must be at least 5 characters and free of special tags.';
        isValid = false;
    }
    
    if (safeDesc.length > 1000) {
        newErrors.desc = 'Description exceeds 1000 characters limit.';
        isValid = false;
    }

    setErrors(newErrors);
    return { isValid, safeTitle, safeDesc };
  };

  const handleSubmit = () => {
    const { isValid, safeTitle, safeDesc } = validate();
    
    if (!isValid) {
        Logger.warn('Create Case Validation Failed', { errors });
        return;
    }

    const newCase: Case = {
      id: `CASE-${Date.now()}` as CaseId, 
      title: safeTitle, 
      description: safeDesc, 
      status: 'OPEN',
      priority: priority as any, 
      assignee: 'Me', 
      reporter: 'Analyst', 
      tasks: [], findings: '', 
      relatedThreatIds: [], created: new Date().toLocaleDateString(), notes: [], artifacts: [], timeline: [],
      agency: 'SENTINEL_CORE', sharingScope: 'INTERNAL', sharedWith: [], labels: [], tlp: 'AMBER'
    };
    
    Logger.info('Case Created', { id: newCase.id, priority });
    onSubmit(newCase);
  };

  return (
    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
      <CardHeader title="Initialize New Case" />
      <div className="p-6 space-y-6 max-w-lg">
        <div>
          <Label>Case Title</Label>
          <Input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Operation Name or Incident ID" 
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && <p className="text-red-500 text-[10px] mt-1">{errors.title}</p>}
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
          <TextArea 
            className={`h-32 ${errors.desc ? 'border-red-500' : ''}`}
            value={desc} 
            onChange={e => setDesc(e.target.value)} 
            placeholder="Detailed summary..." 
          />
          {errors.desc && <p className="text-red-500 text-[10px] mt-1">{errors.desc}</p>}
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
