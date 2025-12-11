
import React, { useState } from 'react';
import { Channel, TeamMessage } from '../../types';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';
import { MessagingLogic } from '../../services/logic/MessagingLogic';
import { StandardPage } from '../Shared/Layouts';
import ChannelList from './ChannelList';
import ChatInterface, { Message } from '../Shared/ChatInterface';
import { Input, Button } from '../Shared/UI';
import Modal from '../Shared/Modal';

const MessagingPlatform: React.FC = () => {
  const [activeChannelId, setActiveChannelId] = useState('C1');
  
  // Efficient subscriptions
  const channels = useDataStore(() => threatData.getChannels() as Channel[]);
  const currentUser = useDataStore(() => threatData.currentUser);
  
  // Subscribe to messages for the specific channel
  // The getter closure captures activeChannelId, ensuring we only get relevant updates
  const messages = useDataStore(() => threatData.getMessages(activeChannelId));
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<Channel['type']>('PUBLIC');

  const activeChannel = channels.find(c => c.id === activeChannelId);

  const handleSendMessage = (text: string) => {
    const { processed } = MessagingLogic.processMessageContent(text, threatData.getSystemUsers());
    const msg: TeamMessage = {
        id: `M-${Date.now()}`,
        channelId: activeChannelId,
        userId: currentUser?.name || 'Anonymous',
        content: processed,
        timestamp: new Date().toISOString(),
        type: 'TEXT'
    };
    threatData.sendMessage(msg);
  };

  const handleCreateChannel = () => {
    if (!newChannelName) return;
    const newChannel: Channel = {
        id: `C-${Date.now()}`,
        name: newChannelName.toLowerCase().replace(/\s/g, '-'),
        type: newChannelType,
        members: ['ALL']
    };
    threatData.createChannel(newChannel);
    setShowCreateModal(false);
    setNewChannelName('');
    setActiveChannelId(newChannel.id);
  };

  // Adapter to convert TeamMessage to ChatInterface Message
  const uiMessages: Message[] = messages.map(m => ({
    id: m.id,
    role: m.userId === currentUser?.name ? 'user' : m.userId === 'System' ? 'system' : 'model',
    text: m.content,
    timestamp: new Date(m.timestamp).getTime(),
    senderName: m.userId
  }));

  return (
    <StandardPage 
        title="Sentinel Chat" 
        subtitle="Secure Internal Communications" 
        modules={[]} 
        activeModule="" 
        onModuleChange={() => {}}
        className="h-full"
    >
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Channel">
         <div className="space-y-4">
            <div>
                <label className="text-xs text-slate-500 uppercase font-bold">Channel Name</label>
                <Input value={newChannelName} onChange={e => setNewChannelName(e.target.value)} placeholder="e.g. op-red-storm" />
            </div>
            <div>
                <label className="text-xs text-slate-500 uppercase font-bold">Type</label>
                <div className="flex gap-2 mt-1">
                    {['PUBLIC', 'PRIVATE', 'WAR_ROOM'].map(t => (
                        <button 
                            key={t}
                            onClick={() => setNewChannelType(t as any)}
                            className={`px-3 py-1 rounded text-xs border ${newChannelType === t ? 'bg-cyan-900 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>
            <Button onClick={handleCreateChannel} className="w-full mt-4">CREATE CHANNEL</Button>
         </div>
      </Modal>

      <div className="flex flex-1 h-[calc(100vh-180px)] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <ChannelList 
            channels={channels} 
            activeChannelId={activeChannelId} 
            onSelect={setActiveChannelId} 
            onCreate={() => setShowCreateModal(true)} 
        />
        
        <div className="flex-1 flex flex-col bg-slate-900">
            {activeChannel ? (
                <>
                    <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                        <div>
                            <h2 className="text-white font-bold flex items-center gap-2">
                                <span className="text-slate-500">{MessagingLogic.getChannelIcon(activeChannel.type)}</span>
                                {activeChannel.name}
                            </h2>
                            <p className="text-xs text-slate-500">{activeChannel.topic || 'No topic set'}</p>
                        </div>
                        <div className="text-xs text-slate-500">{activeChannel.members.length} Members</div>
                    </div>
                    
                    <ChatInterface 
                        messages={uiMessages}
                        onSend={handleSendMessage}
                        className="flex-1 border-none rounded-none bg-slate-900/50"
                        placeholder={`Message #${activeChannel.name}`}
                        userRole="user"
                    />
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500">
                    Select a channel to begin secure comms.
                </div>
            )}
        </div>
      </div>
    </StandardPage>
  );
};

export default MessagingPlatform;
