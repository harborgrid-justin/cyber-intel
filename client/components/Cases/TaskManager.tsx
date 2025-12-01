
import React, { useState } from 'react';
import { Task } from '../../types';
import { Button, Input, Badge, Card, Select, CardHeader, Label } from '../Shared/UI';
import { CaseLogic } from '../services-frontend/logic/CaseLogic';

interface TaskManagerProps {
  tasks: Task[];
  onAdd: (title: string, dependsOn: string[]) => void;
  onToggle: (taskId: string) => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, onAdd, onToggle }) => {
  const [newTask, setNewTask] = useState('');
  const [dependencyId, setDependencyId] = useState<string>('');

  const safeTasks = tasks || [];

  const handleAdd = () => {
    if (newTask.trim()) {
      onAdd(newTask, dependencyId ? [dependencyId] : []);
      setNewTask('');
      setDependencyId('');
    }
  };

  const sortedTasks = CaseLogic.sortTasks(safeTasks);
  const availableDependencies = safeTasks.filter(t => t.status !== 'DONE');
  const progress = safeTasks.length ? Math.round((safeTasks.filter(t => t.status === 'DONE').length / safeTasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <Label className="mb-0">Workflow Progress</Label>
          <Badge color={progress === 100 ? 'green' : 'blue'}>{progress}% Complete</Badge>
        </div>
        <div className="w-full bg-slate-900 border border-slate-800 h-2 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-700 ease-out ${progress === 100 ? 'bg-green-500' : 'bg-cyan-500'}`} style={{ width: `${progress}%` }} />
        </div>
      </div>

      <Card className="p-0 overflow-hidden bg-slate-950/50">
        <CardHeader title="Task Management" />
        <div className="p-4 space-y-3">
            <Label>New Task Entry</Label>
            <div className="flex flex-col md:flex-row gap-2">
            <Input 
                value={newTask} 
                onChange={(e) => setNewTask(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Describe the task..." 
                className="flex-1" 
            />
            {availableDependencies.length > 0 && (
                <Select 
                value={dependencyId} 
                onChange={(e) => setDependencyId(e.target.value)}
                className="md:w-64"
                >
                <option value="">-- No Dependency --</option>
                {availableDependencies.map(t => <option key={t.id} value={t.id}>Blocked By: {t.title}</option>)}
                </Select>
            )}
            <Button onClick={handleAdd} disabled={!newTask.trim()} variant="secondary">Add</Button>
            </div>
        </div>
      </Card>

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
        {sortedTasks.map(task => {
          const blocked = CaseLogic.isTaskBlocked(task, safeTasks);
          const blockerName = blocked ? CaseLogic.getTaskBlockerName(task, safeTasks) : '';
          const isDone = task.status === 'DONE';

          return (
            <div key={task.id} className={`p-3 rounded border transition-all duration-300 flex items-center gap-4 group ${isDone ? 'bg-slate-900/30 border-slate-800 opacity-60' : blocked ? 'bg-slate-900/50 border-orange-900/30 border-l-2 border-l-orange-600' : 'bg-slate-900 border-slate-700 hover:border-cyan-500'}`}>
              <button 
                onClick={() => !blocked && onToggle(task.id)}
                disabled={blocked}
                className={`w-6 h-6 rounded border flex items-center justify-center transition-colors shrink-0 ${isDone ? 'bg-cyan-600 border-cyan-600 text-white' : blocked ? 'border-slate-700 bg-slate-800/50 text-slate-600 cursor-not-allowed' : 'border-slate-500 hover:border-cyan-400 text-transparent hover:text-cyan-500/50'}`}
              >
                {isDone && <span className="text-xs">✓</span>}
                {blocked && <span className="text-xs">🔒</span>}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${isDone ? 'line-through text-slate-500' : blocked ? 'text-slate-400' : 'text-slate-200'}`}>{task.title}</div>
                {blocked && (
                  <div className="text-[10px] text-orange-400 flex items-center gap-1.5 mt-1 bg-orange-900/10 w-fit px-2 py-0.5 rounded border border-orange-900/30 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>WAITING ON: <span className="font-bold">{blockerName}</span>
                  </div>
                )}
                {isDone && task.assignee && <div className="text-[10px] text-green-500/70 mt-1">Completed by {task.assignee}</div>}
              </div>
            </div>
          );
        })}
        {safeTasks.length === 0 && (
          <div className="text-center p-8 border-2 border-dashed border-slate-800 rounded-lg">
             <div className="text-slate-500 text-sm font-bold uppercase tracking-widest">No Active Tasks</div>
             <p className="text-xs text-slate-600 mt-1">Add a task or deploy a playbook to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default TaskManager;
