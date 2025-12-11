
import React, { useState } from 'react';
import { Task } from '../../types';
import { Button, Input, Badge, Card, Select, CardHeader, Label } from '../Shared/UI';
import { CaseLogic } from '../../services/logic/CaseLogic';
import { TopologicalSort } from '../../services/algorithms/TopologicalSort';

interface TaskManagerProps {
  tasks: Task[];
  onAdd: (title: string, dependsOn: string[]) => void;
  onToggle: (taskId: string) => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, onAdd, onToggle }) => {
  const [newTask, setNewTask] = useState('');
  const [dependencyId, setDependencyId] = useState<string>('');

  const handleAdd = () => {
    if (newTask.trim()) {
      // Validate Cycle
      if (dependencyId) {
          try {
              const nodes = [...tasks.map(t => t.id), 'temp'];
              const edges: [string, string][] = tasks.flatMap(t => (t.dependsOn || []).map(d => [d, t.id] as [string, string]));
              edges.push([dependencyId, 'temp']);
              TopologicalSort.sort(nodes, edges);
          } catch (e) {
              alert("Cycle detected! Cannot add dependency.");
              return;
          }
      }
      onAdd(newTask, dependencyId ? [dependencyId] : []);
      setNewTask('');
      setDependencyId('');
    }
  };

  const sortedTasks = CaseLogic.sortTasks(tasks || []);
  const progress = tasks.length ? Math.round((tasks.filter(t => t.status === 'DONE').length / tasks.length) * 100) : 0;

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
            <Input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Describe the task..." className="flex-1" />
            {tasks.length > 0 && (
                <Select value={dependencyId} onChange={(e) => setDependencyId(e.target.value)} className="md:w-64">
                <option value="">-- No Dependency --</option>
                {tasks.filter(t => t.status !== 'DONE').map(t => <option key={t.id} value={t.id}>Blocked By: {t.title}</option>)}
                </Select>
            )}
            <Button onClick={handleAdd} disabled={!newTask.trim()} variant="secondary">Add</Button>
            </div>
        </div>
      </Card>

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
        {sortedTasks.map(task => {
          const blocked = CaseLogic.isTaskBlocked(task, tasks);
          return (
            <div key={task.id} className={`p-3 rounded border transition-all duration-300 flex items-center gap-4 ${task.status === 'DONE' ? 'bg-slate-900/30 border-slate-800 opacity-60' : blocked ? 'bg-slate-900/50 border-orange-900/30' : 'bg-slate-900 border-slate-700 hover:border-cyan-500'}`}>
              <button onClick={() => !blocked && onToggle(task.id)} disabled={blocked} className={`w-6 h-6 rounded border flex items-center justify-center ${task.status === 'DONE' ? 'bg-cyan-600 border-cyan-600 text-white' : blocked ? 'border-slate-700 bg-slate-800 cursor-not-allowed' : 'border-slate-500 hover:border-cyan-400'}`}>
                {task.status === 'DONE' && '✓'}
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-200">{task.title}</div>
                {blocked && <div className="text-[10px] text-orange-400 mt-1">WAITING ON DEPENDENCY</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default TaskManager;
