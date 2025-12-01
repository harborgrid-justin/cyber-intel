
import React, { useState } from 'react';
import { Case } from '../../../types';
import { Button, Card, TextArea, CardHeader, Label } from '../../Shared/UI';
import TaskManager from '../TaskManager';
import CaseTimelineView from './CaseTimelineView';

interface CaseWorkbenchViewProps {
  activeCase: Case;
  onAddTask: (title: string, dependsOn: string[]) => void;
  onToggleTask: (tid: string) => void;
  onPostComment: (c: string) => void;
}

const CaseWorkbenchView: React.FC<CaseWorkbenchViewProps> = ({ 
  activeCase, onAddTask, onToggleTask, onPostComment 
}) => {
  const [comment, setComment] = useState('');

  const handlePost = () => {
      onPostComment(comment);
      setComment('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Left Column: Context & Tasks */}
        <div className="flex flex-col gap-6 h-full overflow-hidden">
            <Card className="p-0 overflow-hidden shadow-sm shrink-0">
                <CardHeader title="Incident Briefing" />
                <div className="p-5 bg-slate-900/50">
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-serif">{activeCase.description || 'No description provided.'}</p>
                    <div className="mt-4 pt-4 border-t border-slate-800 flex gap-4 text-xs">
                        <div><span className="text-slate-500 font-bold uppercase">Assignee:</span> <span className="text-cyan-400 font-mono ml-1">{activeCase.assignee}</span></div>
                        <div><span className="text-slate-500 font-bold uppercase">Priority:</span> <span className={`font-mono font-bold ml-1 ${activeCase.priority === 'CRITICAL' ? 'text-red-500' : 'text-slate-300'}`}>{activeCase.priority}</span></div>
                    </div>
                </div>
            </Card>
            
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                <TaskManager tasks={activeCase.tasks || []} onAdd={onAddTask} onToggle={onToggleTask} />
            </div>
        </div>

        {/* Right Column: Timeline & Notes */}
        <div className="flex flex-col gap-6 h-full overflow-hidden">
            <Card className="flex-1 p-0 overflow-hidden flex flex-col">
                <CardHeader title="Activity Stream" />
                
                {/* Scrollable Timeline/Notes Area */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
                    {/* Timeline Component Embedded */}
                    <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                        <CaseTimelineView activeCase={activeCase} />
                    </div>

                    {/* Notes List */}
                    <div className="space-y-4">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Analyst Notes</div>
                        {activeCase.notes && activeCase.notes.length > 0 ? activeCase.notes.map(n => (
                        <div key={n.id} className="flex gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-400 shrink-0">
                                {(n.author && n.author[0]) ? n.author[0] : '?'}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-baseline mb-1">
                                <span className="text-xs font-bold text-cyan-400">{n.author || 'Unknown'}</span>
                                <span className="text-[10px] text-slate-600">{n.date}</span>
                                </div>
                                <div className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-tr-lg rounded-br-lg rounded-bl-lg border border-slate-800/50 group-hover:border-slate-700 transition-colors">
                                {n.content}
                                </div>
                            </div>
                        </div>
                        )) : (
                        <div className="text-center text-slate-600 text-xs italic py-4">No manual notes recorded.</div>
                        )}
                    </div>
                </div>

                {/* Input Area (Fixed at bottom) */}
                <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
                    <div className="flex gap-2">
                        <TextArea 
                        value={comment} 
                        onChange={e => setComment(e.target.value)} 
                        placeholder="Add an internal note or observation..." 
                        className="flex-1 h-12 resize-none bg-slate-950 text-xs" 
                        />
                        <Button onClick={handlePost} variant="secondary" disabled={!comment.trim()} className="h-12 px-4">POST</Button>
                    </div>
                </div>
            </Card>
        </div>
    </div>
  );
};
export default CaseWorkbenchView;
