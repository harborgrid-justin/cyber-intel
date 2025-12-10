
import React, { useState, useEffect, useRef } from 'react';
import { View } from '../../types';
import { Icons } from './Icons';
import { TOKENS } from '../../styles/theme';

interface Command {
  id: string;
  label: string;
  icon: keyof typeof Icons;
  action: () => void;
  shortcut?: string;
  group: 'Navigation' | 'Action' | 'System';
}

const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    { id: 'nav-dash', label: 'Go to Dashboard', icon: 'Grid', group: 'Navigation', action: () => nav(View.DASHBOARD) },
    { id: 'nav-cases', label: 'Go to Cases', icon: 'Layers', group: 'Navigation', action: () => nav(View.CASES) },
    { id: 'nav-feed', label: 'Threat Feed', icon: 'Activity', group: 'Navigation', action: () => nav(View.FEED) },
    { id: 'nav-settings', label: 'Open Settings', icon: 'Users', group: 'Navigation', action: () => nav(View.SETTINGS) },
    { id: 'act-new-case', label: 'Create New Case', icon: 'FileText', group: 'Action', action: () => dispatch('open-create-case') },
    { id: 'sys-lock', label: 'Lock System', icon: 'Key', group: 'System', action: () => dispatch('lock-screen'), shortcut: 'Ctrl+L' },
    { id: 'sys-theme', label: 'Toggle Theme (Cyber/SaaS)', icon: 'Sun', group: 'System', action: () => dispatch('toggle-theme') },
  ];

  const filtered = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  const nav = (view: View) => {
    window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view } }));
    setIsOpen(false);
  };

  const dispatch = (event: string) => {
    window.dispatchEvent(new Event(event));
    setIsOpen(false);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
      if (isOpen) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => (i + 1) % filtered.length);
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => (i - 1 + filtered.length) % filtered.length);
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            filtered[selectedIndex]?.action();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, filtered, selectedIndex]);

  useEffect(() => {
    if (isOpen) {
        inputRef.current?.focus();
        setSelectedIndex(0);
        setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[var(--zIndex-modalBackdrop)] flex items-start justify-center pt-[20vh] bg-slate-950/80 backdrop-blur-sm`} onClick={() => setIsOpen(false)}>
      <div className={`w-full max-w-2xl bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100`} onClick={e => e.stopPropagation()}>
        <div className={`flex items-center px-4 py-3 border-b border-[var(--colors-borderDefault)]`}>
          <Icons.Code className={`w-5 h-5 text-[var(--colors-textTertiary)] mr-3`} />
          <input 
            ref={inputRef}
            className={`flex-1 bg-transparent text-lg text-[var(--colors-textPrimary)] placeholder-slate-600 focus:outline-none`}
            placeholder="Type a command or search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <span className={`text-xs text-[var(--colors-textTertiary)] font-mono border border-[var(--colors-borderDefault)] px-2 py-1 rounded`}>ESC</span>
        </div>
        <div className="max-h-[60vh] overflow-y-auto py-2 custom-scrollbar">
          {filtered.length === 0 && <div className={`p-4 text-center text-[var(--colors-textSecondary)]`}>No commands found.</div>}
          {filtered.map((cmd, i) => {
            const Icon = Icons[cmd.icon];
            const isSelected = i === selectedIndex;
            return (
              <div 
                key={cmd.id}
                onClick={cmd.action}
                className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${isSelected ? 'bg-blue-500/10 border-l-4 border-blue-500 pl-3' : `hover:bg-[var(--colors-surfaceHighlight)] border-l-4 border-transparent`}`}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-400' : 'text-[var(--colors-textSecondary)]'}`} />
                  <span className={`text-sm ${isSelected ? `text-[var(--colors-textPrimary)] font-bold` : 'text-[var(--colors-textSecondary)]'}`}>{cmd.label}</span>
                </div>
                {cmd.shortcut && <span className={`text-xs text-[var(--colors-textTertiary)] font-mono`}>{cmd.shortcut}</span>}
              </div>
            );
          })}
        </div>
        <div className={`p-2 bg-[var(--colors-surfaceRaised)] border-t border-[var(--colors-borderDefault)] flex justify-between items-center text-[10px] text-[var(--colors-textSecondary)] px-4`}>
            <span>Sentinel Command Interface v2.5</span>
            <div className="flex gap-2">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;