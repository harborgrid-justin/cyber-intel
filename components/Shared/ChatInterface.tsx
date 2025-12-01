
import React, { useRef, useEffect, useState } from 'react';
import { Button } from './UI';

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
  senderName?: string; // Optional display name
}

interface ChatInterfaceProps {
  messages: Message[];
  onSend: (text: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  userRole?: string; // Default 'user'
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSend, 
  isLoading = false, 
  placeholder = "Type a message...",
  className = '',
  userRole = 'user'
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-inner ${className}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50 scroll-smooth custom-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.role === userRole;
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
              <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                {msg.senderName && (
                  <span className="text-[10px] text-slate-500 mb-1 px-1">
                    {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                )}
                <div 
                  className={`rounded-lg px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                    isUser 
                      ? 'bg-cyan-600/20 text-cyan-100 border border-cyan-500/30 rounded-tr-none' 
                      : msg.role === 'system' 
                        ? 'bg-slate-800 text-yellow-500 border border-yellow-500/30 text-xs font-mono w-full text-center'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-slate-800/50 rounded-lg px-4 py-2 text-xs text-slate-500 flex gap-1 items-center border border-slate-800">
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2 shrink-0">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none custom-scrollbar disabled:opacity-50"
        />
        <Button onClick={handleSend} disabled={isLoading || !input.trim()} variant="primary" className="px-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;
