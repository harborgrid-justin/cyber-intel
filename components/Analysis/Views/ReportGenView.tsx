import React, { useState } from 'react';
import { Card, CardHeader, Button, Select, Label } from '../../Shared/UI';
import { useAsync } from '../../../hooks/useAsync';

export const ReportGenView: React.FC = () => {
  const [type, setType] = useState('Executive');
  // Use custom hook for safe fetching/execution
  const { execute, status, value: data, error } = useAsync<{ content: string }>();
  const loading = status === 'PENDING';

  const handleGen = () => {
     // Normally you'd pass body in options, here assuming hook handles it or we mock call
     // For demonstration of the hook pattern in this context:
     execute(new Promise(resolve => setTimeout(() => resolve({ content: "Report Generated" }), 2000)));
  };

  return (
    <Card className="max-w-xl mx-auto mt-10 p-0 overflow-hidden">
        <CardHeader title="AI Report Generator" />
        <div className="p-6 space-y-4">
            <div>
                <Label>Report Type</Label>
                <Select value={type} onChange={e => setType(e.target.value)}>
                    <option value="Executive">Executive Summary</option>
                    <option value="Technical">Technical Deep Dive</option>
                    <option value="Timeline">Incident Timeline</option>
                </Select>
            </div>
            
            <div className="bg-slate-900 p-4 rounded border border-slate-800 text-xs text-slate-400">
                AI will ingest current session context, active threats, and correlated cases to build a {type} report draft.
            </div>

            {error && <div className="text-red-500 text-xs">{error}</div>}
            {data && <div className="text-green-500 text-xs">Draft created successfully.</div>}

            <Button onClick={handleGen} disabled={loading} className="w-full">
                {loading ? 'GENERATING...' : 'GENERATE DRAFT'}
            </Button>
        </div>
    </Card>
  );
};