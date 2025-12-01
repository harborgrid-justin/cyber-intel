import React, { useState } from 'react';
import { Case } from '../../types';

interface Props { onCancel: () => void; onSubmit: (c: Case) => void; }

const CreateCaseForm: React.FC<Props> = ({ onCancel, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  const handleSubmit = () => {
    if(!title) return;
    const newCase: Case = {
      id: `CASE-${Date.now()}`, title, description: desc, status: 'OPEN',
      priority: priority as any, assignee: 'Me', reporter: 'Analyst', tasks: [], findings: '', 
      relatedThreatIds: [], created: new Date().toLocaleDateString(), notes: [], artifacts: [], timeline: [],
      agency: 'SENTINEL_CORE', sharingScope: 'INTERNAL', sharedWith: [], labels: [], tlp: 'AMBER'
    };
    onSubmit(newCase);
  };

  return (
    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">Initialize New Case</h2>
      <div className="space-y-4 max-w-lg">
        <div>
          <label className="text-xs text-slate-500 uppercase font-bold">Case Title</label>
          <input className="w-full bg-slate-950 border border-slate-800 p-3 rounded text-white mt-1" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase font-bold">Priority</label>
          <select className="w-full bg-slate-950 border border-slate-800 p-3 rounded text-white mt-1" value={priority} onChange={e => setPriority(e.target.value)}>
            <option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase font-bold">Description</label>
          <textarea className="w-full bg-slate-950 border border-slate-800 p-3 rounded text-white mt-1 h-32" value={desc} onChange={e => setDesc(e.target.value)} />
        </div>
        <div className="flex gap-4 pt-4">
          <button onClick={handleSubmit} className="bg-cyan-600 text-white px-6 py-2 rounded font-bold">CREATE</button>
          <button onClick={onCancel} className="text-slate-400 px-6 py-2 font-bold">CANCEL</button>
        </div>
      </div>
    </div>
  );
};
export default CreateCaseForm;