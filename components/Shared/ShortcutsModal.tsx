
import React from 'react';
import Modal from './Modal';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';

export const ShortcutsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  // Declaratively bind the close action
  useKeyboardShortcut('Escape', onClose);
  
  const shortcuts = [
    { key: 'Ctrl + K', desc: 'Open Command Palette' },
    { key: 'Ctrl + /', desc: 'Search' },
    { key: 'Esc', desc: 'Close Modals' },
    { key: 'Ctrl + L', desc: 'Lock Screen' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts">
        <div className="space-y-2">
            {shortcuts.map(s => (
                <div key={s.key} className="flex justify-between items-center p-2 border-b border-slate-800">
                    <span className="text-slate-400 text-sm">{s.desc}</span>
                    <span className="bg-slate-800 text-white font-mono text-xs px-2 py-1 rounded border border-slate-700">{s.key}</span>
                </div>
            ))}
        </div>
    </Modal>
  );
};
