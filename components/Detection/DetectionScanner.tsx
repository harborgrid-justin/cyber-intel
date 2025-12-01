
import React, { useState } from 'react';
import { scanTextForIoCs } from '../../services/detectionEngine';
import { Threat } from '../../types';
import FeedItem from '../Feed/FeedItem';
import { threatData } from '../../services/dataLayer';
import { Card, Button, TextArea, Grid } from '../Shared/UI';
import { StandardPage } from '../Shared/Layouts';
import { CONFIG } from '../../config';

const DetectionScanner: React.FC = () => {
  const [activeModule, setActiveModule] = useState(CONFIG.MODULES.DETECTION[0]);
  const [logInput, setLogInput] = useState('');
  const [results, setResults] = useState<Threat[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [yaraRule, setYaraRule] = useState('rule example_rule {\n  meta:\n    description = "Detects suspicious string"\n  strings:\n    $a = "evil_string"\n  condition:\n    $a\n}');

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setResults(scanTextForIoCs(logInput));
      setIsScanning(false);
    }, 800);
  };

  const handlePromoteAll = () => {
    if(results.length === 0) return;
    
    // 1. Add threats to the global feed
    results.forEach(t => threatData.addThreat(t));

    // 2. Create an investigation case
    threatData.addCase({
      id: `CASE-${Date.now()}`, title: `Log Analysis Batch: ${results.length} IoCs`, description: `Batch promotion of IoCs detected from log analysis.\n\nIndicators:\n${results.map(r => r.indicator).join('\n')}`,
      status: 'OPEN', priority: 'HIGH', assignee: 'Unassigned', reporter: 'Detection_Scanner', tasks: [], findings: '', relatedThreatIds: results.map(r => r.id), created: new Date().toLocaleDateString(),
      notes: [], artifacts: [], timeline: [], agency: 'SENTINEL_CORE', sharingScope: 'INTERNAL', sharedWith: [], labels: ['Detection', 'Batch'], tlp: 'AMBER'
    });
    
    alert(`Promoted ${results.length} findings to Threat Feed and created Case.`);
    setResults([]); // Clear local results after promotion
  };

  return (
    <StandardPage 
      title="Detection & Analysis" 
      subtitle="Log Sandbox & YARA Rule Development"
      modules={CONFIG.MODULES.DETECTION} 
      activeModule={activeModule} 
      onModuleChange={setActiveModule}
    >
      {activeModule === 'Scanner' && (
        <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
          <Card className="flex-1 flex flex-col p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">Log Analysis Sandbox</h3>
              <Button onClick={handleScan} disabled={isScanning}>
                {isScanning ? 'SCANNING...' : 'SCAN LOGS'}
              </Button>
            </div>
            <TextArea 
              value={logInput} 
              onChange={(e) => setLogInput(e.target.value)} 
              placeholder="Paste raw server logs, headers, or text dumps here..." 
              className="flex-1 w-full border-none focus:ring-0 rounded-none p-4 font-mono text-sm resize-none bg-slate-900"
            />
          </Card>
          
          <Card className="lg:w-96 flex flex-col p-0 overflow-hidden h-96 lg:h-auto">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">Results</h3>
                <p className="text-xs text-slate-500 mt-0.5">{results.length} hits found</p>
              </div>
              {results.length > 0 && <Button onClick={handlePromoteAll} variant="secondary" className="px-2 py-1 text-[10px]">PROMOTE ALL</Button>}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/50 custom-scrollbar">
              {results.length === 0 ? (
                <div className="text-center text-slate-500 text-xs mt-10">Run scan to see results.</div>
              ) : (
                results.map((threat) => <FeedItem key={threat.id} threat={threat} />)
              )}
            </div>
          </Card>
        </div>
      )}

      {activeModule === 'YARA' && (
        <Card className="flex-1 p-0 flex flex-col overflow-hidden">
           <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">YARA Rule Editor</h3>
              <div className="flex gap-2">
                 <Button variant="secondary">Validate</Button>
                 <Button variant="primary">Save Rule</Button>
              </div>
           </div>
           <TextArea 
             className="flex-1 bg-slate-900 text-green-400 font-mono p-4 focus:outline-none resize-none border-none" 
             value={yaraRule}
             onChange={(e) => setYaraRule(e.target.value)}
             spellCheck={false}
           />
        </Card>
      )}

      {!['Scanner', 'YARA'].includes(activeModule) && (
        <div className="flex-1 flex items-center justify-center p-12 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 uppercase tracking-widest">
          {activeModule} Module Interface
        </div>
      )}
    </StandardPage>
  );
};
export default DetectionScanner;
