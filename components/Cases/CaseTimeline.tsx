
import React, { useState } from 'react';
import { TimelineEvent } from '../../types';
import { Badge } from '../Shared/UI';

interface CaseTimelineProps {
  events: TimelineEvent[];
  caseId: string;
  onAddEvent?: (event: Omit<TimelineEvent, 'id' | 'date'>) => void;
}

const CaseTimeline: React.FC<CaseTimelineProps> = ({ events, caseId, onAddEvent }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<TimelineEvent['type']>('NOTE');
  const [newEventDescription, setNewEventDescription] = useState('');

  const sortedEvents = [...events].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getEventIcon = (type: TimelineEvent['type']) => {
    const icons: Record<TimelineEvent['type'], string> = {
      ALERT: '🚨',
      ACTION: '⚡',
      NOTE: '📝',
      SYSTEM: '⚙️',
      START: '▶️',
      END: '⏹️',
      CASE: '📋',
      REPORT: '📄'
    };
    return icons[type] || '•';
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    const colors: Record<TimelineEvent['type'], string> = {
      ALERT: 'text-red-400 border-red-600',
      ACTION: 'text-blue-400 border-blue-600',
      NOTE: 'text-gray-400 border-gray-600',
      SYSTEM: 'text-purple-400 border-purple-600',
      START: 'text-green-400 border-green-600',
      END: 'text-orange-400 border-orange-600',
      CASE: 'text-cyan-400 border-cyan-600',
      REPORT: 'text-yellow-400 border-yellow-600'
    };
    return colors[type] || 'text-gray-400 border-gray-600';
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddEvent = () => {
    if (!newEventTitle.trim()) return;

    onAddEvent?.({
      title: newEventTitle,
      type: newEventType,
      description: newEventDescription
    });

    setNewEventTitle('');
    setNewEventDescription('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-200">Case Timeline</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add Event'}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Event Title</label>
            <input
              type="text"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder="Enter event title"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Event Type</label>
            <select
              value={newEventType}
              onChange={(e) => setNewEventType(e.target.value as TimelineEvent['type'])}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="NOTE">Note</option>
              <option value="ACTION">Action</option>
              <option value="ALERT">Alert</option>
              <option value="SYSTEM">System</option>
              <option value="REPORT">Report</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Description (Optional)</label>
            <textarea
              value={newEventDescription}
              onChange={(e) => setNewEventDescription(e.target.value)}
              placeholder="Enter event description"
              rows={3}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleAddEvent}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
          >
            Add Event
          </button>
        </div>
      )}

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-700"></div>

        {/* Timeline Events */}
        <div className="space-y-4">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No timeline events yet
            </div>
          ) : (
            sortedEvents.map((event, index) => (
              <div key={event.id} className="relative pl-12 animate-in fade-in slide-in-from-left duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                {/* Timeline Dot */}
                <div className={`absolute left-2 top-1 w-5 h-5 rounded-full border-2 ${getEventColor(event.type)} bg-slate-900 flex items-center justify-center text-xs`}>
                  {getEventIcon(event.type)}
                </div>

                {/* Event Content */}
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 hover:border-slate-600 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-medium text-slate-200">{event.title}</h4>
                    <Badge className="text-[10px]">{event.type}</Badge>
                  </div>

                  <p className="text-xs text-slate-400 mb-2">{formatDate(event.date)}</p>

                  {event.description && (
                    <p className="text-xs text-slate-300 mt-2">{event.description}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-slate-800">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-xl font-bold text-blue-400">{sortedEvents.length}</div>
            <div className="text-[10px] text-slate-500">Total Events</div>
          </div>
          <div>
            <div className="text-xl font-bold text-red-400">
              {sortedEvents.filter(e => e.type === 'ALERT').length}
            </div>
            <div className="text-[10px] text-slate-500">Alerts</div>
          </div>
          <div>
            <div className="text-xl font-bold text-green-400">
              {sortedEvents.filter(e => e.type === 'ACTION').length}
            </div>
            <div className="text-[10px] text-slate-500">Actions</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-400">
              {sortedEvents.filter(e => e.type === 'SYSTEM').length}
            </div>
            <div className="text-[10px] text-slate-500">System</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseTimeline;
