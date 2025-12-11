

import React, { useRef, useEffect, useState } from 'react';
import { Button } from './UI';
import { useThrottledCallback } from '../../hooks/useThrottle';
// FIX: Module '"../../styles/theme"' has no exported member 'EXECUTIVE_THEME'. This is now exported.
// FIX: '"../../styles/theme"' has no exported member named 'tokens'. Did you mean 'TOKENS'?
import { EXECUTIVE_THEME, TOKENS } from '../../styles/theme';
import { Icons } from './Icons';

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
  senderName?: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSend: (text: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  userRole?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, onSend, isLoading = false, placeholder = "Enter command or query...", className = '', userRole = 'user'
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useThrottledCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, 100);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if(input.trim()) { onSend(input); setInput(''); }
    }
  };

  return (
    <div className={`flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative ${className}`}>
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth custom-scrollbar relative z-10">
        {messages.map((msg) => {
          const isUser = msg.role === userRole;
          const isSystem = msg.role === 'system';
          
          if (isSystem) {
              return (
                  <div key={msg.id} className="flex justify-center my-4">
                      <div className="bg-slate-900/80 border border-slate-700 text-xs font-mono text-slate-400 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm backdrop-blur-sm">
                          <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
                          {msg.text}
                      </div>
                  </div>
              );
          }

          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}>
               <div className={`flex items-center gap-2 mb-1 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{msg.senderName || (isUser ? 'OPERATOR' : 'SENTINEL AI')}</span>
                    <span className="text-[9px] text-slate-600 font-mono">{new Date(msg.timestamp).toLocaleTimeString()}</span>
               </div>
               
               <div className={`
                 max-w-[90%] md:max-w-[80%] rounded-lg px-5 py-3 text-sm leading-relaxed shadow-md backdrop-blur-sm border
                 ${isUser 
                    ? `bg-blue-600 text-white border-blue-500 rounded-tr-none shadow-blue-900/20` 
                    : `bg-slate-900/90 text-slate-200 border-slate-700 rounded-tl-none shadow-black/30 font-mono`
                 }
               `}>
                 {msg.text.split('\n').map((line, i) => <div key={i} className="min-h-[1.2em]">{line}</div>)}
               </div>
            </div>
          );
        })}
        
        {isLoading && (
            <div className="flex items-start">
                 <div className="bg-slate-900 border border-slate-700 rounded-lg rounded-tl-none px-4 py-3 flex gap-2 items-center">
                    <span className="text-[10px] text-cyan-500 font-mono animate-pulse">COMPUTING...</span>
                    <div className="flex gap-1">
                        <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className={`p-4 bg-slate-900 border-t border-slate-800 shrink-0 relative z-20`}>
        <div className="relative flex items-center">
            <div className="absolute left-3 text-slate-500">
                <Icons.Code className="w-4 h-4" />
            </div>
            <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={handleKeyDown}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 text-slate-200 text-sm font-mono rounded-lg pl-10 pr-12 py-3 shadow-inner focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all placeholder-slate-600" 
                placeholder={placeholder}
                autoFocus
            />
            <button 
                onClick={() => { if(input.trim()) { onSend(input); setInput(''); } }}
                disabled={!input.trim()}
                className={`absolute right-2 p-1.5 rounded-md transition-all ${input.trim() ? 'text-cyan-400 hover:bg-cyan-900/30' : 'text-slate-700 cursor-not-allowed'}`}
            >
                <Icons.Share2 className="w-4 h-4 rotate-90" />
            </button>
        </div>
        <div className="text-[9px] text-slate-600 mt-2 font-mono flex justify-between px-1">
            <span>SECURE CHANNEL ENCRYPTED [AES-256]</span>
            <span>SENTINEL CORE v2.5</span>
        </div>
      </div>
    </div>
  );
};
export default ChatInterface;