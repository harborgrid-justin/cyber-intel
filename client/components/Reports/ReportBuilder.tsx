
import React, { useState, useEffect } from 'react';
import { Card, Button, Input, FilterGroup, Select, CardHeader, Label } from '../Shared/UI';
import { DetailViewHeader } from '../Shared/Layouts';
import ResponsiveTable from '../Shared/ResponsiveTable';
import { threatData } from '../../services-frontend/dataLayer';
import { REPORT_BOILERPLATE, MOCK_TEMPLATES } from '../../constants';
import { Threat, Case, ThreatActor, IncidentReport, ReportSection } from '../../types';
import ReportSectionList from './ReportSectionList';

interface ReportBuilderProps {
  onCancel: () => void;
  onSave: () => void;
}

const ReportBuilder: React.FC<ReportBuilderProps> = ({ onCancel, onSave }) => {
  const [templateId, setTemplateId] = useState('FBI');
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [dataTab, setDataTab] = useState('Threats');
  
  const [threats, setThreats] = useState<Threat[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [actors, setActors] = useState<ThreatActor[]>([]);

  useEffect(() => {
    setThreats(threatData.getThreats());
    setCases(threatData.getCases());
    setActors(threatData.getActors());
  }, []);

  useEffect(() => {
    const templateSections = REPORT_BOILERPLATE[templateId] || REPORT_BOILERPLATE['FBI'];
    // Deep copy to prevent mutating the template
    const initSections = templateSections.map(s => ({ ...s, id: `${s.id}-${Date.now()}` }));
    setSections(initSections);
    setActiveSectionId(initSections[0]?.id || '');
  }, [templateId]);

  const handleUpdateSection = (id: string, content: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, content } : s));
  };

  const handleAddToReport = (item: any, type: string) => {
    let entry = '';
    if (type === 'THREAT') {
        const t = item as Threat;
        entry = `\n[IOC] ${t.type}: ${t.indicator} | Sev: ${t.severity}\n`;
    } else if (type === 'CASE') {
        const c = item as Case;
        entry = `\n[CASE] ${c.title} (${c.status})\n`;
    } else if (type === 'ACTOR') {
        const a = item as ThreatActor;
        entry = `\n[ACTOR] ${a.name} (${a.origin})\n`;
    }
    
    // Add to active section or append to last
    const targetId = activeSectionId || sections[sections.length - 1]?.id;
    if (targetId) {
        setSections(prev => prev.map(s => s.id === targetId ? { ...s, content: s.content + entry } : s));
    }
  };

  const handlePublish = () => {
    if (!title) return alert("Please enter a report title.");
    const content = sections.map(s => `${s.title}:\n${s.content}`).join('\n\n');
    
    const newReport: IncidentReport = {
        id: `RPT-${Date.now()}`,
        title: title,
        type: templateId === 'EXEC' ? 'Executive' : templateId === 'FBI' ? 'Forensic' : 'Technical',
        date: new Date().toLocaleDateString(),
        author: 'Analyst.Me',
        status: 'READY',
        content: content
    };
    
    threatData.addReport(newReport);
    onSave();
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <DetailViewHeader 
        title={title || "Untitled Report"}
        subtitle="New Intelligence Product"
        onBack={onCancel}
        actions={<Button onClick={handlePublish} variant="primary" className="text-[10px] py-1">PUBLISH REPORT</Button>}
      />

      <div className="p-4 bg-slate-900 border-b border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
         <div>
            <Label>Report Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Operation Deep Dive Summary" autoFocus />
         </div>
         <div>
            <Label>Template Basis</Label>
            <Select value={templateId} onChange={e => setTemplateId(e.target.value)}>
                {MOCK_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
            </Select>
         </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
         {/* Data Picker */}
         <div className="lg:w-1/3 flex flex-col border-r border-slate-800 bg-slate-900/50">
            <div className="p-3 border-b border-slate-800 flex justify-between items-center">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assets</span>
               <FilterGroup value={dataTab} onChange={setDataTab} options={[{ label: 'Threats', value: 'Threats' }, { label: 'Cases', value: 'Cases' }, { label: 'Actors', value: 'Actors' }]} />
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {dataTab === 'Threats' && (
                    <ResponsiveTable<Threat> data={threats} keyExtractor={t => t.id}
                        columns={[{ header: 'Indicator', render: t => <span className="font-mono text-xs text-white">{t.indicator}</span> }, { header: '+', render: t => <Button onClick={() => handleAddToReport(t, 'THREAT')} variant="secondary" className="px-2 py-0.5 text-[10px]">+</Button> }]}
                        renderMobileCard={t => <div className="flex justify-between"><span>{t.indicator}</span><Button onClick={() => handleAddToReport(t, 'THREAT')} variant="secondary">+</Button></div>}
                    />
                )}
                {dataTab === 'Cases' && (
                    <ResponsiveTable<Case> data={cases} keyExtractor={c => c.id}
                        columns={[{ header: 'Case', render: c => <span className="text-xs font-bold text-white">{c.title}</span> }, { header: '+', render: c => <Button onClick={() => handleAddToReport(c, 'CASE')} variant="secondary" className="px-2 py-0.5 text-[10px]">+</Button> }]}
                        renderMobileCard={c => <div className="flex justify-between"><span>{c.title}</span><Button onClick={() => handleAddToReport(c, 'CASE')} variant="secondary">+</Button></div>}
                    />
                )}
                {dataTab === 'Actors' && (
                    <ResponsiveTable<ThreatActor> data={actors} keyExtractor={a => a.id}
                        columns={[{ header: 'Name', render: a => <span className="text-xs font-bold text-white">{a.name}</span> }, { header: '+', render: a => <Button onClick={() => handleAddToReport(a, 'ACTOR')} variant="secondary" className="px-2 py-0.5 text-[10px]">+</Button> }]}
                        renderMobileCard={a => <div className="flex justify-between"><span>{a.name}</span><Button onClick={() => handleAddToReport(a, 'ACTOR')} variant="secondary">+</Button></div>}
                    />
                )}
            </div>
         </div>

         {/* Live Editor */}
         <div className="flex-1 flex flex-col bg-slate-900/20">
            <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Section Editor</span>
               <span className="text-xs text-cyan-500 font-mono">{sections.length} BLOCKS</span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <ReportSectionList 
                    sections={sections} 
                    onReorder={setSections} 
                    onUpdate={handleUpdateSection} 
                    activeSectionId={activeSectionId}
                    onSelect={setActiveSectionId}
                />
            </div>
         </div>
      </div>
    </div>
  );
};

export default ReportBuilder;
