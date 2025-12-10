
import React from 'react';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { Button } from './UI';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'text', className = '' }) => {
  const { copied, copy } = useCopyToClipboard();

  return (
    <div className={`relative group bg-slate-950 border border-slate-800 rounded-lg overflow-hidden ${className}`}>
      <div className="flex justify-between items-center px-3 py-1 bg-slate-900 border-b border-slate-800">
        <span className="text-[10px] font-mono text-slate-500 uppercase">{language}</span>
        <Button 
          variant="text" 
          onClick={() => copy(code)} 
          className="text-[10px] h-6 px-2 text-slate-500 hover:text-white"
        >
          {copied ? 'COPIED' : 'COPY'}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed custom-scrollbar">
        <code>{code}</code>
      </pre>
    </div>
  );
};
