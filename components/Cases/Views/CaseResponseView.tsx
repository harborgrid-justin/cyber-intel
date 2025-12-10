import React, { useState, useMemo } from 'react';
// Fix: Import types from the central types file
import { IncidentReport, View, Case } from '../../../types';
import { Button, Card, CardHeader } from '../../Shared/UI';
import { threatData } from '../../../services/dataLayer';
import { generateCaseReport } from '../../../services/geminiService';
import CaseCoordinationView from './CaseCoordinationView';
import { Icons } from '../../Shared/Icons';
import { useDataStore } from '../../../hooks/useDataStore';

interface CaseResponseViewProps {
  activeCase: Case;
  onTransfer: (agency: string) => void;
  onShare: (agency: string) => void;
  onGenerateReport: (type: IncidentReport['type']) => void;
}

const CaseResponseView: React.FC<CaseResponseViewProps> = ({ activeCase, onTransfer, onShare, onGenerateReport }) => {
  const allReports = useDataStore(() => threatData.getReports());
  const reports = useMemo(() => allReports.filter(r => r.relatedCaseId === activeCase.id), [allReports, activeCase.id]);
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = async (type: IncidentReport['type']) => {
      setGenerating(type);
      const content = await generateCaseReport(activeCase, type);
      threatData.addReport({ id: `RPT-${Date.now()}`, title: `${type} Report: ${activeCase.title}`, type, date: new Date().toLocaleDateString(), author: 'Analyst.Me (AI-Assist)', status: 'DRAFT', content, relatedCaseId: activeCase.id });
      setGenerating(null);
      onGenerateReport(type); 
  };
  
  const handleViewReport = (id: string) => window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view: View.REPORTS, id } }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CaseCoordinationView activeCase={activeCase} onTransfer={onTransfer} onShare={onShare} />
      
      <Card className="p-0 overflow-hidden flex flex-col border-l-4 border-l-[var(--colors-primary)]">
        <CardHeader title="Reporting & Documentation" />
        <div className="p-6 space-y-4">
            <p className="text-xs text-[var(--colors-textSecondary)]">Generate intelligence products from this case file for dissemination.</p>
            <div className="flex gap-2">
                <Button onClick={() => handleGenerate('Executive')} disabled={!!generating} className="flex-1 text-xs">
                    {generating === 'Executive' ? 'GENERATING...' : <><Icons.Users className="w-3 h-3 mr-1"/> Executive Summary</>}
                </Button>
                <Button onClick={() => handleGenerate('Technical')} disabled={!!generating} variant="secondary" className="flex-1 text-xs">
                    {generating === 'Technical' ? 'GENERATING...' : <><Icons.Code className="w-3 h-3 mr-1"/> Technical Report</>}
                </Button>
            </div>
            
            <div className="space-y-2 mt-4 pt-4 border-t border-[var(--colors-borderDefault)]">
                <div className="text-[10px] text-[var(--colors-textTertiary)] uppercase font-bold">Generated Reports</div>
                {reports.map(r => (
                    <div key={r.id} className="p-2 bg-[var(--colors-surfaceHighlight)] rounded flex justify-between items-center">
                        <span className="text-xs font-bold text-[var(--colors-textPrimary)]">{r.title}</span>
                        <Button onClick={() => handleViewReport(r.id)} variant="text" className="text-xs">VIEW</Button>
                    </div>
                ))}
            </div>
        </div>
      </Card>

    </div>
  );
};
export default CaseResponseView;