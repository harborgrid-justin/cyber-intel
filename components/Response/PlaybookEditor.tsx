
import React, { useState } from 'react';
import { Badge, Button } from '../Shared/UI';

interface PlaybookAction {
  id: string;
  name: string;
  type: string;
  description: string;
  parameters: Record<string, any>;
  dependsOn?: string[];
}

interface Playbook {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: PlaybookAction[];
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
}

interface PlaybookEditorProps {
  playbook?: Playbook;
  onSave?: (playbook: Playbook) => void;
  onCancel?: () => void;
  availableActions?: PlaybookAction[];
}

const PlaybookEditor: React.FC<PlaybookEditorProps> = ({
  playbook,
  onSave,
  onCancel,
  availableActions = []
}) => {
  const [name, setName] = useState(playbook?.name || '');
  const [description, setDescription] = useState(playbook?.description || '');
  const [trigger, setTrigger] = useState(playbook?.trigger || 'MANUAL');
  const [actions, setActions] = useState<PlaybookAction[]>(playbook?.actions || []);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const handleAddAction = (action: PlaybookAction) => {
    setActions([...actions, { ...action, id: `ACT-${Date.now()}` }]);
  };

  const handleRemoveAction = (id: string) => {
    setActions(actions.filter(a => a.id !== id));
  };

  const handleSave = () => {
    const pb: Playbook = {
      id: playbook?.id || `PB-${Date.now()}`,
      name,
      description,
      trigger,
      actions,
      status: playbook?.status || 'DRAFT'
    };
    onSave?.(pb);
  };

  const getActionIcon = (type: string) => {
    const icons: Record<string, string> = {
      ISOLATE: '🔒',
      BLOCK: '🚫',
      NOTIFY: '📢',
      COLLECT: '📦',
      ANALYZE: '🔍',
      REMEDIATE: '🔧'
    };
    return icons[type] || '⚡';
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-200">Playbook Editor</h3>
        <div className="flex gap-2">
          {onCancel && (
            <Button onClick={onCancel} variant="secondary" className="text-xs px-3 py-1">
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} variant="primary" className="text-xs px-3 py-1">
            Save Playbook
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Playbook Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter playbook name"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Trigger Type</label>
          <select
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200"
          >
            <option value="MANUAL">Manual</option>
            <option value="AUTOMATIC">Automatic</option>
            <option value="SCHEDULED">Scheduled</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter playbook description"
          rows={2}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200"
        />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        {/* Available Actions */}
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-2">Available Actions</h4>
          <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-2 max-h-64 overflow-y-auto space-y-1">
            {availableActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleAddAction(action)}
                className="w-full text-left p-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-blue-500 rounded transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getActionIcon(action.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">{action.name}</p>
                    <p className="text-[10px] text-slate-500">{action.type}</p>
                  </div>
                  <Badge className="text-[10px]">+</Badge>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Playbook Actions */}
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-2">Playbook Actions ({actions.length})</h4>
          <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-2 max-h-64 overflow-y-auto space-y-2">
            {actions.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No actions added yet</p>
            ) : (
              actions.map((action, index) => (
                <div
                  key={action.id}
                  className="bg-slate-900/50 border border-slate-700 rounded-lg p-2 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="text-slate-500 text-xs font-mono">#{index + 1}</span>
                      <span className="text-lg">{getActionIcon(action.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-200">{action.name}</p>
                        <Badge color="blue" className="text-[10px] mt-1">{action.type}</Badge>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveAction(action.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaybookEditor;
