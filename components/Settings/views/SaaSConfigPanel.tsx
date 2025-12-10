
import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Label, CardHeader } from '../../Shared/UI';
// Fix: Import types from the central types file
import { AppConfig } from '../../../types';

interface Props {
  config: AppConfig;
  onSave: (config: AppConfig) => void;
}

export const SaaSConfigPanel: React.FC<Props> = ({ config, onSave }) => {
  const [tempConfig, setTempConfig] = useState(config);
  
  useEffect(() => { setTempConfig(config); }, [config]);

  const handleChange = (field: keyof AppConfig, val: string) => {
    setTempConfig(prev => ({ ...prev, [field]: val }));
  };

  return (
    <Card className="p-0 overflow-hidden border-l-4 border-l-cyan-500">
         <CardHeader title="SaaS Identity Configuration" action={<Button onClick={() => onSave(tempConfig)} variant="primary" className="text-[10px] py-1">SAVE CHANGES</Button>} />
         <div className="p-6 space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div><Label>Platform Name</Label><Input value={tempConfig.appName} onChange={e => handleChange('appName', e.target.value)} /></div>
                 <div><Label>Subtitle</Label><Input value={tempConfig.subtitle} onChange={e => handleChange('subtitle', e.target.value)} /></div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                     <Label>Current Threat Level</Label>
                     <Select value={tempConfig.threatLevel} onChange={e => handleChange('threatLevel', e.target.value)} className="bg-slate-950">
                         <option>LOW (DEFCON 5)</option>
                         <option>GUARDED (DEFCON 4)</option>
                         <option>ELEVATED (DEFCON 3)</option>
                         <option>SEVERE (DEFCON 2)</option>
                         <option>CRITICAL (DEFCON 1)</option>
                     </Select>
                 </div>
                 <div><Label>Organization Name</Label><Input value={tempConfig.orgName} onChange={e => handleChange('orgName', e.target.value)} /></div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-800 pt-4">
                 <div><Label>Support Email</Label><Input value={tempConfig.supportEmail || ''} onChange={e => handleChange('supportEmail', e.target.value)} /></div>
                 <div><Label>Support Phone</Label><Input value={tempConfig.supportPhone || ''} onChange={e => handleChange('supportPhone', e.target.value)} /></div>
             </div>
         </div>
    </Card>
  );
};
