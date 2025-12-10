import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Input, FilterGroup, Select, Label } from '../Shared/UI';
import { DetailViewHeader } from '../Shared/Layouts';
import { threatData } from '../../services/dataLayer';
import { ReportSection } from '../../types';
import ReportSectionList from './ReportSectionList';
import { Caretaker, StateOriginator } from '../../services/patterns/Memento';
import { Icons } from '../Shared/Icons';

interface ReportBuilderProps { onCancel: () => void; onSave: () => void; }

const ReportBuilder: React.FC<ReportBuilderProps> = ({ onCancel, onSave }) => {
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  
  // Memento setup
  const originator = useRef(new StateOriginator<ReportSection[]>([]));
  const caretaker = useRef(new Caretaker<ReportSection[]>(originator.current));

  useEffect(() => {
    // Init state
    const initSections = [{ id: `s1`, title: 'Executive Summary', content: '' }];
    setSections(initSections);
    originator.current.setState(initSections);
    caretaker.current.backup();
  }, []);

  const updateSections = (newSections: ReportSection[]) => {
      setSections(newSections);
      originator.current.setState(newSections);
      caretaker.current.backup();
  };

  const handleUndo = () => {
      caretaker.current.undo();
      setSections(originator.current.getState());
  };

  const handleUpdateContent = (id: string, content: string) => {
      const updated = sections.map(s => s.id === id ? { ...s, content } : s);
      // We don't backup on every keystroke, only on blur/save ideally, 
      // but for simplicity here we update state directly.
      setSections(updated);
  };
  
  // Save snap on blur or distinct action could go here.

  const handlePublish = () => {
    if (!title) return alert("Enter title");
    threatData.addReport({
        id: `RPT-${Date.now()}`, title, type: 'Executive', date: new Date().toLocaleDateString(),
        author: 'Analyst', status: 'DRAFT', content: JSON.stringify(sections)
    });
    onSave();
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <DetailViewHeader 
        title={title || "Untitled Report"}
        subtitle="New Intelligence Product"
        onBack={onCancel}
        actions={
            <div className="flex gap-2">
                <Button onClick={handleUndo} variant="secondary" className="text-[10px]"><Icons.Refresh className="w-3 h-3 mr-1"/> UNDO</Button>
                <Button onClick={handlePublish} variant="primary" className="text-[10px]">PUBLISH</Button>
            </div>
        }
      />
      <div className="p-4 bg-slate-900 border-b border-slate-800">
         <Label>Report Title</Label>
         <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title..." />
      </div>
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-900/20">
        <ReportSectionList 
            sections={sections} 
            onReorder={updateSections} 
            onUpdate={handleUpdateContent} 
            activeSectionId={activeSectionId}
            onSelect={setActiveSectionId}
        />
      </div>
    </div>
  );
};
export default ReportBuilder;