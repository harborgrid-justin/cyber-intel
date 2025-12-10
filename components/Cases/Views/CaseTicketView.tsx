
import React, { useState, useCallback } from 'react';
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

  const handlePost = useCallback(() => {
      onPostComment(comment);
      setComment('');
  }, [comment, onPostComment]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Left Column: Context & Tasks */}
        <div className="flex flex-col gap-6 h-full overflow-hidden">
            <Card className="p-0 overflow-hidden shadow-sm shrink-0">
                <CardHeader title="Incident Briefing" />
                <div className="p-5 bg-[var(--colors-surfaceHighlight)]/50">
                    <p className="text-sm text-[var(--colors-textSecondary)] whitespace-pre-wrap leading-relaxed font-serif">{activeCase.description || 'No description provided.'}</p>
                    <div className="mt-4 pt-4 border-t border-[var(--colors-borderDefault)] flex gap-4 text-xs">
                        <div><span className="text-[var(--colors-textTertiary)] font-bold uppercase">Assignee:</span> <span className="text-[var(--colors-primary)] font-mono ml-1">{activeCase.assignee}</span></div>
                        <div><span className="text-[var(--colors-textTertiary)] font-bold uppercase">Priority:</span> <span className={`font-mono font-bold ml-1 ${activeCase.priority === 'CRITICAL' ? 'text-[var(--colors-critical)]' : 'text-[var(--colors-textPrimary)]'}`}>{activeCase.priority}</span></div>
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
                    <div className="bg-[var(--colors-surfaceHighlight)]/50 rounded-xl p-4 border border-[var(--colors-borderDefault)]">
                        <CaseTimelineView activeCase={activeCase} />
                    </div>

                    {/* Notes List */}
                    <div className="space-y-4">
                        <div className="text-xs font-bold text-[var(--colors-textTertiary)] uppercase tracking-widest px-1">Analyst Notes</div>
                        {activeCase.notes && activeCase.notes.length > 0 ? activeCase.notes.map(n => (
                        <div key={n.id} className="flex gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-[var(--colors-surfaceRaised)] border border-[var(--colors-borderDefault)] flex items-center justify-center font-bold text-xs text-[var(--colors-textSecondary)] shrink-0">
                                {(n.author && n.author[0]) ? n.author[0] : '?'}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-baseline mb-1">
                                <span className="text-xs font-bold text-[var(--colors-primary)]">{n.author || 'Unknown'}</span>
                                <span className="text-[10px] text-[var(--colors-textTertiary)]">{n.date}</span>
                                </div>
                                <div className="text-sm text-[var(--colors-textSecondary)] bg-[var(--colors-surfaceHighlight)]/50 p-3 rounded-tr-lg rounded-br-lg rounded-bl-lg border border-[var(--colors-surfaceHighlight)]/50 group-hover:border-[var(--colors-borderDefault)] transition-colors">
                                {n.content}
                                </div>
                            </div>
                        </div>
                        )) : (
                        <div className="text-center text-[var(--colors-textTertiary)] text-xs italic py-4">No manual notes recorded.</div>
                        )}
                    </div>
                </div>

                {/* Input Area (Fixed at bottom) */}
                <div className="p-4 bg-[var(--colors-surfaceRaised)] border-t border-[var(--colors-borderDefault)] shrink-0">
                    <div className="flex gap-2">
                        <TextArea 
                        value={comment} 
                        onChange={e => setComment(e.target.value)} 
                        placeholder="Add an internal note or observation..." 
                        className="flex-1 h-12 resize-none bg-[var(--colors-surfaceHighlight)] text-xs" 
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