
import React, { useState } from 'react';
import { Task } from '../../types';
import { Badge } from '../Shared/UI';

interface TaskBoardProps {
  tasks: Task[];
  onAddTask?: (title: string, dependsOn: string[]) => void;
  onToggleTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  caseId: string;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  caseId
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const pendingTasks = tasks.filter(t => t.status === 'PENDING');
  const doneTasks = tasks.filter(t => t.status === 'DONE');

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    onAddTask?.(newTaskTitle, selectedDependencies);
    setNewTaskTitle('');
    setSelectedDependencies([]);
    setShowAddForm(false);
  };

  const canCompleteTask = (task: Task): boolean => {
    if (!task.dependsOn || task.dependsOn.length === 0) return true;

    return task.dependsOn.every(depTitle => {
      const depTask = tasks.find(t => t.title === depTitle);
      return depTask?.status === 'DONE';
    });
  };

  const getProgress = () => {
    if (tasks.length === 0) return 0;
    return Math.round((doneTasks.length / tasks.length) * 100);
  };

  const toggleDependency = (taskTitle: string) => {
    setSelectedDependencies(prev =>
      prev.includes(taskTitle)
        ? prev.filter(t => t !== taskTitle)
        : [...prev, taskTitle]
    );
  };

  const TaskCard: React.FC<{ task: Task; showDependencies?: boolean }> = ({ task, showDependencies = true }) => {
    const isBlocked = !canCompleteTask(task);
    const hasDependencies = task.dependsOn && task.dependsOn.length > 0;

    return (
      <div
        className={`bg-slate-800/50 border rounded-lg p-3 hover:border-slate-600 transition-all group ${
          isBlocked && task.status === 'PENDING' ? 'border-yellow-600/50' : 'border-slate-700'
        }`}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={() => onToggleTask?.(task.id)}
            disabled={isBlocked && task.status === 'PENDING'}
            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 transition-all ${
              task.status === 'DONE'
                ? 'bg-green-600 border-green-600'
                : isBlocked
                ? 'border-yellow-600 cursor-not-allowed opacity-50'
                : 'border-slate-500 hover:border-blue-500'
            } flex items-center justify-center`}
          >
            {task.status === 'DONE' && (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <p className={`text-sm ${task.status === 'DONE' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
              {task.title}
            </p>

            {showDependencies && hasDependencies && (
              <div className="mt-2 flex flex-wrap gap-1">
                {task.dependsOn!.map((dep) => {
                  const depTask = tasks.find(t => t.title === dep);
                  return (
                    <Badge
                      key={dep}
                      color={depTask?.status === 'DONE' ? 'green' : 'yellow'}
                      className="text-[10px]"
                    >
                      ↳ {dep}
                    </Badge>
                  );
                })}
              </div>
            )}

            {isBlocked && task.status === 'PENDING' && (
              <p className="text-[10px] text-yellow-500 mt-1">⚠️ Blocked by dependencies</p>
            )}
          </div>

          {onDeleteTask && (
            <button
              onClick={() => onDeleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-200">Task Board</h3>
          <p className="text-xs text-slate-500">Manage case tasks and dependencies</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-slate-800 rounded-md p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              List
            </button>
          </div>
          {onAddTask && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              {showAddForm ? 'Cancel' : '+ Add Task'}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-400">Overall Progress</span>
          <span className="text-sm font-bold text-blue-400">{getProgress()}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-green-600 transition-all duration-500"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-slate-500">
          <span>{doneTasks.length} completed</span>
          <span>{pendingTasks.length} pending</span>
        </div>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Task Title</label>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Enter task title"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            />
          </div>

          {tasks.length > 0 && (
            <div>
              <label className="block text-xs text-slate-400 mb-2">Dependencies (Optional)</label>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {tasks.filter(t => t.status === 'PENDING').map((task) => (
                  <label key={task.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/30 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedDependencies.includes(task.title)}
                      onChange={() => toggleDependency(task.title)}
                      className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-300">{task.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAddTask}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
          >
            Add Task
          </button>
        </div>
      )}

      {/* Task Views */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-2 gap-4">
          {/* Pending Column */}
          <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-slate-300">Pending</h4>
              <Badge color="yellow">{pendingTasks.length}</Badge>
            </div>
            <div className="space-y-2">
              {pendingTasks.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No pending tasks</p>
              ) : (
                pendingTasks.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </div>
          </div>

          {/* Done Column */}
          <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-slate-300">Done</h4>
              <Badge color="green">{doneTasks.length}</Badge>
            </div>
            <div className="space-y-2">
              {doneTasks.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No completed tasks</p>
              ) : (
                doneTasks.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No tasks yet. Add a task to get started.</p>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
