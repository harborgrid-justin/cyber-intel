
import React, { useState } from 'react';
import { Badge } from '../Shared/UI';

interface WorkflowState {
  id: string;
  name: string;
  type: 'START' | 'INTERMEDIATE' | 'END' | 'DECISION';
  description?: string;
}

interface WorkflowTransition {
  id: string;
  name: string;
  targetStateId: string;
  requiresApproval?: boolean;
}

interface CaseWorkflowProps {
  currentState: string;
  workflowName: string;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  onTransition?: (transitionId: string) => void;
  history?: Array<{ from: string; to: string; timestamp: string; user: string }>;
}

const CaseWorkflow: React.FC<CaseWorkflowProps> = ({
  currentState,
  workflowName,
  states,
  transitions,
  onTransition,
  history = []
}) => {
  const [selectedTransition, setSelectedTransition] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const getCurrentState = () => states.find(s => s.id === currentState);

  const getAvailableTransitions = () => {
    const current = getCurrentState();
    if (!current) return [];
    return transitions.filter(t =>
      states.find(s => s.id === currentState)
    );
  };

  const getStateColor = (state: WorkflowState) => {
    if (state.id === currentState) return 'bg-blue-600 text-white';
    if (state.type === 'START') return 'bg-green-600/20 text-green-400 border-green-600';
    if (state.type === 'END') return 'bg-red-600/20 text-red-400 border-red-600';
    if (state.type === 'DECISION') return 'bg-yellow-600/20 text-yellow-400 border-yellow-600';
    return 'bg-slate-700/50 text-slate-400 border-slate-600';
  };

  const getStateIcon = (type: WorkflowState['type']) => {
    const icons = {
      START: '▶️',
      INTERMEDIATE: '⚡',
      END: '⏹️',
      DECISION: '🔀'
    };
    return icons[type];
  };

  const handleTransition = (transitionId: string) => {
    if (onTransition) {
      onTransition(transitionId);
      setSelectedTransition(null);
    }
  };

  const currentStateObj = getCurrentState();
  const availableTransitions = getAvailableTransitions();

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-200">{workflowName}</h3>
          <p className="text-xs text-slate-500">Workflow Management</p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md transition-colors"
        >
          {showHistory ? 'Hide' : 'Show'} History
        </button>
      </div>

      {/* Current State */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{getStateIcon(currentStateObj?.type || 'INTERMEDIATE')}</span>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Current State</h4>
            <p className="text-xs text-slate-500">Active workflow status</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Badge color="blue" className="text-sm px-3 py-1">
            {currentStateObj?.name || 'Unknown'}
          </Badge>
          {currentStateObj?.description && (
            <span className="text-xs text-slate-400">{currentStateObj.description}</span>
          )}
        </div>
      </div>

      {/* Workflow States Visualization */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Workflow States</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {states.map((state) => (
            <div
              key={state.id}
              className={`border rounded-lg p-3 transition-all ${getStateColor(state)} ${
                state.id === currentState ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{getStateIcon(state.type)}</span>
                <span className="text-xs font-medium">{state.name}</span>
              </div>
              {state.description && (
                <p className="text-[10px] opacity-75 mt-1">{state.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Available Transitions */}
      {availableTransitions.length > 0 && (
        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Available Transitions</h4>
          <div className="space-y-2">
            {availableTransitions.map((transition) => {
              const targetState = states.find(s => s.id === transition.targetStateId);
              return (
                <button
                  key={transition.id}
                  onClick={() => setSelectedTransition(transition.id)}
                  className="w-full text-left px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-blue-500 rounded-lg transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors">
                          {transition.name}
                        </span>
                        {transition.requiresApproval && (
                          <Badge color="yellow" className="text-[10px]">Requires Approval</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span>{currentStateObj?.name}</span>
                        <span>→</span>
                        <span className="text-blue-400">{targetState?.name}</span>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Transition Confirmation */}
      {selectedTransition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedTransition(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Confirm Transition</h3>
            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to transition this case? This action will update the workflow state.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleTransition(selectedTransition)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
              >
                Confirm
              </button>
              <button
                onClick={() => setSelectedTransition(null)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workflow History */}
      {showHistory && (
        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Workflow History</h4>
          {history.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No workflow history available</p>
          ) : (
            <div className="space-y-2">
              {history.map((entry, index) => (
                <div key={index} className="text-xs border-l-2 border-blue-600 pl-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 font-medium">
                      {entry.from} → {entry.to}
                    </span>
                    <span className="text-slate-500">{entry.user}</span>
                  </div>
                  <span className="text-slate-500">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CaseWorkflow;
