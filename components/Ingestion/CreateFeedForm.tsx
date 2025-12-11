



import React, { useState } from 'react';
import { Button, Input } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';

interface Props {
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateFeedForm: React.FC<Props> = ({ onCancel, onSuccess }) => {
  const [name, setName] = useState('');
  
  const handleAdd = () => {
    if(!name) return;
    threatData.addFeed({ id: `FEED-${Date.now()}`, name: name, url: 'http://...', type: 'JSON_FEED', status: 'ACTIVE', interval: 60, lastSync: 'Never' });
    onSuccess();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex gap-4 items-center mb-6 animate-in fade-in slide-in-from-top-4">
        <Input 
            className="flex-1 bg-slate-950 border border-slate-800 p-2 rounded text-white outline-none focus:border-cyan-500" 
            placeholder="New Feed Name (e.g. AbuseIPDB)" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            autoFocus
        />
        <Button onClick={handleAdd}>SAVE SOURCE</Button>
        <Button onClick={onCancel} variant="text">CANCEL</Button>
    </div>
  );
};

export default CreateFeedForm;
