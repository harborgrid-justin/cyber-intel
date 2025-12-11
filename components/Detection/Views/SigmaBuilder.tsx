
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Select } from '../../Shared/UI';
import { DetectionLogic } from '../../../services/logic/DetectionLogic';
import { SyntaxEditor } from '../../Shared/SyntaxEditor';

export const SigmaBuilder: React.FC = () => {
    const [yaml, setYaml] = useState('title: Suspicious PowerShell\ndetection:\n  selection:\n    Image: powershell.exe\n    CommandLine: "* -enc *"');
    const [target, setTarget] = useState<'SPLUNK' | 'ELASTIC'>('SPLUNK');
    const [output, setOutput] = useState('');
    
    useEffect(() => {
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
};
