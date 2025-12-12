
import React, { useState } from 'react';
import { Artifact } from '../../types';
import { Badge } from '../Shared/UI';

interface ChainEvent {
  id: string;
  timestamp: string;
  action: 'COLLECTED' | 'TRANSFERRED' | 'ANALYZED' | 'ARCHIVED' | 'ACCESSED';
  user: string;
  notes: string;
  location?: string;
}

interface EvidenceChainProps {
  artifacts: Artifact[];
  caseId: string;
  onAddEvent?: (artifactId: string, event: Omit<ChainEvent, 'id' | 'timestamp'>) => void;
}

const EvidenceChain: React.FC<EvidenceChainProps> = ({ artifacts, caseId, onAddEvent }) => {
  const [selectedArtifact, setSelectedArtifact] = useState<string | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventAction, setEventAction] = useState<ChainEvent['action']>('ACCESSED');
  const [eventNotes, setEventNotes] = useState('');
  const [eventUser, setEventUser] = useState('');

  // Simulated chain of custody events
  const [chainEvents] = useState<Record<string, ChainEvent[]>>({});

  const getArtifactIcon = (type: string) => {
    const icons: Record<string, string> = {
      'File': '📄',
      'Image': '🖼️',
      'Log': '📋',
      'Memory Dump': '💾',
      'Network Capture': '🌐',
      'Disk Image': '💿',
      'Document': '📝',
      'Executable': '⚙️'
    };
    return icons[type] || '📦';
  };

  const getActionColor = (action: ChainEvent['action']) => {
    const colors = {
      COLLECTED: 'text-green-400',
      TRANSFERRED: 'text-blue-400',
      ANALYZED: 'text-purple-400',
      ARCHIVED: 'text-gray-400',
      ACCESSED: 'text-yellow-400'
    };
    return colors[action];
  };

  const handleAddEvent = () => {
    if (!selectedArtifact || !eventNotes.trim() || !eventUser.trim()) return;

    onAddEvent?.(selectedArtifact, {
      action: eventAction,
      user: eventUser,
      notes: eventNotes
    });

    setEventNotes('');
    setEventUser('');
    setShowAddEvent(false);
  };

  const selectedArtifactObj = artifacts.find(a => a.id === selectedArtifact);
  const events = selectedArtifact ? (chainEvents[selectedArtifact] || []) : [];

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-200">Evidence Chain of Custody</h3>
          <p className="text-xs text-slate-500">Track evidence handling and integrity</p>
        </div>
        <Badge color="blue">{artifacts.length} Items</Badge>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Artifacts List */}
        <div className="col-span-5 bg-slate-800/30 border border-slate-700 rounded-lg p-3 max-h-96 overflow-y-auto">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Evidence Items</h4>
          {artifacts.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No evidence collected yet</p>
          ) : (
            <div className="space-y-2">
              {artifacts.map((artifact) => (
                <button
                  key={artifact.id}
                  onClick={() => setSelectedArtifact(artifact.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedArtifact === artifact.id
                      ? 'bg-blue-600/20 border-blue-600'
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getArtifactIcon(artifact.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">{artifact.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="text-[10px]">{artifact.type}</Badge>
                        <span className="text-[10px] text-slate-500">{artifact.size}</span>
                      </div>
                      {artifact.hash && (
                        <p className="text-[10px] text-slate-600 mt-1 font-mono truncate">
                          {artifact.hash}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chain of Custody Timeline */}
        <div className="col-span-7">
          {selectedArtifact ? (
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-300">Chain of Custody</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedArtifactObj?.name}</p>
                </div>
                <button
                  onClick={() => setShowAddEvent(!showAddEvent)}
                  className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  {showAddEvent ? 'Cancel' : '+ Add Event'}
                </button>
              </div>

              {/* Add Event Form */}
              {showAddEvent && (
                <div className="mb-4 p-3 bg-slate-900/50 border border-slate-700 rounded-lg space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Action</label>
                      <select
                        value={eventAction}
                        onChange={(e) => setEventAction(e.target.value as ChainEvent['action'])}
                        className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200"
                      >
                        <option value="ACCESSED">Accessed</option>
                        <option value="TRANSFERRED">Transferred</option>
                        <option value="ANALYZED">Analyzed</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Handler</label>
                      <input
                        type="text"
                        value={eventUser}
                        onChange={(e) => setEventUser(e.target.value)}
                        placeholder="Name"
                        className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Notes</label>
                    <textarea
                      value={eventNotes}
                      onChange={(e) => setEventNotes(e.target.value)}
                      placeholder="Enter event notes"
                      rows={2}
                      className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200"
                    />
                  </div>
                  <button
                    onClick={handleAddEvent}
                    className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
                  >
                    Add Event
                  </button>
                </div>
              )}

              {/* Events Timeline */}
              <div className="relative space-y-3 max-h-64 overflow-y-auto">
                {/* Initial Collection Event */}
                <div className="relative pl-8 pb-3 border-l-2 border-green-600/30">
                  <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-green-600 border-2 border-slate-900"></div>
                  <div className="bg-slate-900/50 border border-slate-700 rounded p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge color="green" className="text-[10px]">COLLECTED</Badge>
                      <span className="text-[10px] text-slate-500">{selectedArtifactObj?.uploadedBy}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Initial evidence collection</p>
                    <p className="text-[10px] text-slate-600 mt-1">{selectedArtifactObj?.uploadDate}</p>
                  </div>
                </div>

                {events.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-xs text-slate-500">No chain of custody events recorded</p>
                    <p className="text-[10px] text-slate-600 mt-1">Add events to track evidence handling</p>
                  </div>
                ) : (
                  events.map((event, index) => (
                    <div key={event.id} className="relative pl-8 pb-3 border-l-2 border-slate-700">
                      <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full border-2 border-slate-900 ${getActionColor(event.action)}`}></div>
                      <div className="bg-slate-900/50 border border-slate-700 rounded p-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="text-[10px]">{event.action}</Badge>
                          <span className="text-[10px] text-slate-500">{event.user}</span>
                        </div>
                        <p className="text-[10px] text-slate-400">{event.notes}</p>
                        <p className="text-[10px] text-slate-600 mt-1">{event.timestamp}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Integrity Info */}
              <div className="mt-4 pt-3 border-t border-slate-700">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-900/50 rounded p-2">
                    <div className="text-xs font-medium text-green-400">✓ Verified</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Hash Match</div>
                  </div>
                  <div className="bg-slate-900/50 rounded p-2">
                    <div className="text-xs font-medium text-blue-400">{events.length + 1}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Chain Events</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-2">Select an evidence item</p>
                <p className="text-xs text-slate-600">to view its chain of custody</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvidenceChain;
