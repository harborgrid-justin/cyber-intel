
import React, { useState } from 'react';
import { Card, CardHeader, Button, TextArea, Badge, Input, Select } from '../../Shared/UI';
import { DetectionLogic } from '../../services-frontend/logic/DetectionLogic';
import { threatData } from '../../services-frontend/dataLayer';

export const RuleViews = {
  LogAnalysis: () => {
    const [filter, setFilter] = useState('');
    const logs = threatData.getAuditLogs().filter(l => l.details.includes(filter) || l.action.includes(filter));
    return (
      <Card className="h-full p-0 flex flex-col">
        <CardHeader title="Structured Log Viewer" action={<Input placeholder="Filter logs (grep)..." value={filter} onChange={e => setFilter(e.target.value)} className="w-48 text-xs" />} />
        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1 bg-slate-950">
          {logs.map(l => (
            <div key={l.id} className="border-l-2 border-slate-800 pl-2 hover:border-cyan-500 hover:bg-slate-900/50">
              <span className="text-slate-500">{l.timestamp}</span> <span className={l.action.includes('FAIL') ? 'text-red-400' : 'text-green-400'}>{l.action}</span> <span className="text-slate-300">{l.details}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  },

  YaraEditor: () => {
    const [rule, setRule] = useState('rule Detect_Malware {\n  strings:\n    $a = "suspicious_string"\n  condition:\n    $a\n}');
    const [status, setStatus] = useState<string>('');
    const handleTest = () => {
      const res = DetectionLogic.validateYara(rule);
      setStatus(res.valid ? 'Syntax Valid. Scanning active memory...' : `Error: ${res.error}`);
    };
    return (
      <div className="flex flex-col h-full gap-4">
        <Card className="flex-1 p-0 flex flex-col">
          <CardHeader title="YARA Rule Editor" action={<Button onClick={handleTest} className="text-xs">SCAN SYSTEM</Button>} />
          <TextArea value={rule} onChange={e => setRule(e.target.value)} className="flex-1 bg-slate-950 font-mono text-green-400 p-4 border-none resize-none focus:ring-0" />
        </Card>
        {status && <div className={`p-3 rounded border ${status.includes('Error') ? 'bg-red-900/20 border-red-500 text-red-300' : 'bg-green-900/20 border-green-500 text-green-300'}`}>{status}</div>}
      </div>
    );
  },

  SigmaBuilder: () => {
    const [yaml, setYaml] = useState('title: Suspicious PowerShell\ndetection:\n  selection:\n    Image: powershell.exe\n    CommandLine: "* -enc *"');
    const [target, setTarget] = useState<'SPLUNK' | 'ELASTIC'>('SPLUNK');
    return (
      <div className="grid grid-cols-2 gap-6 h-full">
        <Card className="p-0 flex flex-col">
          <CardHeader title="Sigma Rule (YAML)" />
          <TextArea value={yaml} onChange={e => setYaml(e.target.value)} className="flex-1 bg-slate-950 font-mono text-yellow-100 p-4 border-none resize-none" />
        </Card>
        <Card className="p-0 flex flex-col">
          <CardHeader title="Transpiled Query" action={<Select value={target} onChange={e => setTarget(e.target.value as any)}><option value="SPLUNK">Splunk</option><option value="ELASTIC">Elastic</option></Select>} />
          <div className="flex-1 bg-slate-900 p-4 font-mono text-cyan-400 text-xs whitespace-pre-wrap">
            {DetectionLogic.transpileSigma(yaml, target)}
          </div>
        </Card>
      </div>
    );
  }
};
