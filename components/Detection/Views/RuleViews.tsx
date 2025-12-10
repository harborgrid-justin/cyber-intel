
import React, { useState } from 'react';
import { Card, CardHeader, Button, Badge, Input, Select } from '../../Shared/UI';
import { DetectionLogic } from '../../../services/logic/DetectionLogic';
import { threatData } from '../../../services/dataLayer';
import { useDataStore } from '../../../hooks/useDataStore';
import { SyntaxEditor } from '../../Shared/SyntaxEditor';

export const RuleViews = {
  LogAnalysis: () => {
    const [filter, setFilter] = useState('');
    const logs = useDataStore(() => threatData.getAuditLogs());
    
    const filteredLogs = logs.filter(l => l.details.includes(filter) || l.action.includes(filter));
    
    return (
      <Card className="h-full p-0 flex flex-col">
        <CardHeader title="Structured Log Viewer" action={<Input placeholder="Filter logs (grep)..." value={filter} onChange={e => setFilter(e.target.value)} className="w-48 text-xs" />} />
        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1 bg-slate-950">
          {filteredLogs.map(l => (
            <div key={l.id} className="border-l-2 border-slate-800 pl-2 hover:border-cyan-500 hover:bg-slate-900/50">
              <span className="text-slate-500">{l.timestamp}</span> <span className={l.action.includes('FAIL') ? 'text-red-400' : 'text-green-400'}>{l.action}</span> <span className="text-slate-300">{l.details}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  },

  YaraEditor: () => {
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
  },

  SigmaBuilder: () => {
    const [yaml, setYaml] = useState('title: Suspicious PowerShell\ndetection:\n  selection:\n    Image: powershell.exe\n    CommandLine: "* -enc *"');
    const [target, setTarget] = useState<'SPLUNK' | 'ELASTIC'>('SPLUNK');
    const [output, setOutput] = useState('');
    
    React.useEffect(() => {
        DetectionLogic.transpileSigma(yaml, target).then(setOutput);
    }, []);

    React.useEffect(() => {
        DetectionLogic.transpileSigma(yaml, target).then(setOutput);
    }, [yaml, target]);

    return (
      <div className="grid grid-cols-2 gap-6 h-full">
        <Card className="p-0 flex flex-col">
          <CardHeader title="Sigma Rule (YAML)" />
          <div className="flex-1 p-0">
             <SyntaxEditor value={yaml} onChange={setYaml} language="yaml" className="h-full border-0 rounded-none" />
          </div>
        </Card>
        <Card className="p-0 flex flex-col">
          <CardHeader title="Transpiled Query" action={<Select value={target} onChange={e => setTarget(e.target.value as any)}><option value="SPLUNK">Splunk</option><option value="ELASTIC">Elastic</option></Select>} />
          <div className="flex-1 bg-slate-900 p-4 font-mono text-cyan-400 text-xs whitespace-pre-wrap">
            {output}
          </div>
        </Card>
      </div>
    );
  }
};
