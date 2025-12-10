
import React from 'react';
import { Portal } from './Portal';
import { FocusTrap } from './FocusTrap';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <Portal>
      <FocusTrap isActive={isOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-xl">
              <h3 className="text-lg font-bold text-white tracking-wide uppercase">{title}</h3>
              <button 
                onClick={onClose} 
                className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                aria-label="Close Modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </div>
        </div>
      </FocusTrap>
    </Portal>
  );
};
export default Modal;
