
import React, { useState } from 'react';
import { Channel } from '../../types';
import { MessagingLogic } from '../../services/logic/MessagingLogic';
import { Button, Input } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';

interface Props {
  channels: Channel[];
  activeChannelId: string;
  onSelect: (id: string) => void;
}

const ChannelList: React.FC<Props> = ({ channels, activeChannelId, onSelect }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const sorted = MessagingLogic.sortChannels(channels);

  const handleCreateChannel = () => {
    if (!newChannelName) return;
    const newChannel: Channel = {
        id: `C-${Date.now()}`,
        name: newChannelName.toLowerCase().replace(/\s/g, '-'),
        type: 'PUBLIC',
        members: ['ALL']
    };
    threatData.createChannel(newChannel);
    setIsCreating(false);
    setNewChannelName('');
    onSelect(newChannel.id);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800 w-64 shrink-0">
      <div className="p-4 border-b border-slate-800">
        <div className="flex justify-between items-center">
            <h3 className="text-white font-bold uppercase tracking-widest text-sm">Channels</h3>
            <Button onClick={() => setIsCreating(!isCreating)} variant="text" className="text-slate-400 hover:text-white text-lg leading-none p-0">
              {isCreating ? '×' : '+'}
            </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isCreating && (
            <div className="p-2 space-y-2 bg-slate-900 rounded border border-slate-800 mb-2 animate-in fade-in slide-in-from-top-2">
                <Input 
                    value={newChannelName}
                    onChange={e => setNewChannelName(e.target.value)}
                    placeholder="New channel name..."
                    className="text-xs h-8"
                    autoFocus
                />
                <Button onClick={handleCreateChannel} className="w-full text-xs h-8">CREATE</Button>
            </div>
        )}
        {sorted.map(c => {
            const isActive = c.id === activeChannelId;
            const icon = MessagingLogic.getChannelIcon(c.type);
            return (
                <div 
                    key={c.id} 
                    onClick={() => onSelect(c.id)}
                    className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
                >
                    <span className="text-xs">{icon}</span>
                    <span className={`text-sm font-medium truncate ${c.type === 'WAR_ROOM' ? 'text-red-400' : ''}`}>{c.name}</span>
                    {c.type === 'WAR_ROOM' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-auto"></span>}
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default ChannelList;
