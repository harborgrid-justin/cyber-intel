
import React, { useState } from 'react';
import { Card, CardHeader, Button } from '../../Shared/UI';
import { DetectionLogic } from '../../../services/logic/DetectionLogic';
import { SyntaxEditor } from '../../Shared/SyntaxEditor';

export const YaraEditor: React.FC = () => {
    const [rule, setRule] = useState('rule Detect_Malware {\n  meta:\n    description = "Detects suspicious strings"\n  strings:\n    $a = "cmd.exe /c"\n    $b = "powershell -enc"\n  condition:\n    $a or $b\n}');
    const [status, setStatus] = useState<string>('');
    const handleTest = async () => {
      const res = await DetectionLogic.validateYara(rule);
      const msg = res.valid ? 'Syntax Valid. Scanning active memory...' : `Error: ${res.error}`;
      setStatus(msg);
      window.dispatchEvent(new CustomEvent('notification', { detail: { title: 'YARA Scan', message: msg, type: res.valid ? 'success' : 'warning' } }));
    };
    return (
      <div className="flex flex-col h-full gap-4">
        <Card className="flex-1 p-0 flex flex-col">
          <CardHeader title="YARA Rule Editor" action={<Button onClick={handleTest} className="text-xs">SCAN SYSTEM</Button>} />
          <div className="flex-1 p-0">
            <SyntaxEditor value={rule} onChange={setRule} language="yara" className="h-full border-0 rounded-none" />
          </div>
        </Card>
        {status && <div className={`p-3 rounded border ${status.includes('Error') ? 'bg-red-900/20 border-red-500 text-red-300' : 'bg-green-900/20 border-green-500 text-green-300'}`}>{status}</div>}
      </div>
    );
};
