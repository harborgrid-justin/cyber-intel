
import React from 'react';
import { Case } from '../../../types';
import { Button, Card, TextArea, CardHeader } from '../../Shared/UI';
import TaskManager from '../TaskManager';

interface CaseTicketViewProps {
  activeCase: Case;
  onAddTask: (title: string, dependsOn: string[]) => void;
  onToggleTask: (tid: string) => void;
  comment: string;
  setComment: (c: string) => void;
  onPostComment: () => void;
}

const CaseTicketView: React.FC<CaseTicketViewProps> = ({ 
  activeCase, onAddTask, onToggleTask, comment, setComment, onPostComment 
}) => {
  return (
    <>
      <Card className="p-0 overflow-hidden shadow-sm">
         <CardHeader title="Incident Description" />
         <div className="p-5">
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{activeCase.description || 'No description provided.'}</p>
         </div>
      </Card>
      
      <TaskManager tasks={activeCase.tasks || []} onAdd={onAddTask} onToggle={onToggleTask} />

      <div className="border-t border-slate-800 pt-6">
         <div className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest px-1">Activity Stream</div>
         <div className="flex gap-2 mb-6">
            <TextArea 
              value={comment} 
              onChange={e => setComment(e.target.value)} 
              placeholder="Add an internal note or observation..." 
              className="flex-1 h-20 resize-none" 
            />
            <Button onClick={onPostComment} variant="secondary" disabled={!comment.trim()}>POST</Button>
         </div>
         <div className="space-y-4">
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
              <div className="text-center text-slate-600 text-xs italic py-4">No activity recorded.</div>
            )}
         </div>
      </div>
    </>
  );
};
export default CaseTicketView;
