
import React, { useState, useEffect, useRef } from 'react';
// Fix: Import types from the central types file.
import { Playbook } from '../../types';
import { Card, ProgressBar, Button } from '../Shared/UI';

interface PlaybookRunnerProps {
  playbook: Playbook;
  onComplete: () => void;
}

const PlaybookRunner: React.FC<PlaybookRunnerProps> = ({ playbook, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<'RUNNING' | 'COMPLETE' | 'FAILED'>('RUNNING');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playbook.tasks) return;
    const steps = [ { msg: `Initializing ${playbook.name}...`, delay: 500 }, ...playbook.tasks.map(t => ({ msg: `EXECUTING: ${t}...`, delay: 1500 })), { msg: `PLAYBOOK COMPLETE.`, delay: 200 } ];
    let timer: any;
    let stepIndex = 0;

    const runStep = () => {
      if (stepIndex >= steps.length) { setStatus('COMPLETE'); return; }
      const step = steps[stepIndex];
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step.msg}`]);
      setCurrentStep(Math.round(((stepIndex + 1) / steps.length) * 100));
      stepIndex++;
      timer = setTimeout(runStep, step.delay);
    };
    runStep();
    return () => clearTimeout(timer);
  }, [playbook]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [logs]);

  return (
    <Card className="bg-slate-950 border-slate-800 p-0 h-96">
      <div className="p-4 flex-1 overflow-y-auto" ref={scrollRef}>
        {logs.map((log, i) => ( <div key={i} className="text-xs text-green-400 mb-1 font-mono"><span className="text-slate-600 mr-2">$</span>{log}</div>))}
        {status === 'RUNNING' && <div className="w-2 h-4 bg-green-500 animate-pulse inline-block ml-2"></div>}
      </div>
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex justify-between text-xs text-slate-400 mb-2"><span>PROGRESS</span><span>{currentStep}%</span></div>
        <ProgressBar value={currentStep} color={status === 'COMPLETE' ? 'green' : 'cyan'} />
        {status === 'COMPLETE' && <Button onClick={onComplete} className="w-full mt-4">CLOSE</Button>}
      </div>
    </Card>
  );
};
export default PlaybookRunner;