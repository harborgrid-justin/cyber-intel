
import React from 'react';

interface SyntaxEditorProps {
  value: string;
  onChange: (val: string) => void;
  language: 'yara' | 'yaml' | 'json';
  className?: string;
}

export const SyntaxEditor: React.FC<SyntaxEditorProps> = ({ value, onChange, language, className = '' }) => {
  // Simple heuristic highlighting for visual flair
  const renderHighlighted = () => {
    if (!value) return null;
    return value.split('\n').map((line, i) => {
      let content: React.ReactNode = line;
      
      if (language === 'yara') {
        if (line.trim().startsWith('rule')) content = <><span className="text-purple-400 font-bold">rule</span>{line.substring(4)}</>;
        else if (line.includes('strings:') || line.includes('condition:')) content = <span className="text-red-400 font-bold">{line}</span>;
        else if (line.includes('$')) content = <span className="text-blue-400">{line}</span>;
      }
      else if (language === 'yaml') {
        const parts = line.split(':');
        if (parts.length > 1) {
            content = <><span className="text-cyan-400">{parts[0]}:</span><span className="text-green-300">{parts.slice(1).join(':')}</span></>;
        }
      }

      return <div key={i} className="whitespace-pre">{content}</div>;
    });
  };

  return (
    <div className={`relative group font-mono text-sm bg-slate-950 border border-slate-800 rounded-lg overflow-hidden ${className}`}>
      {/* Background Highlighter */}
      <div className="absolute inset-0 p-4 pointer-events-none overflow-hidden opacity-50 z-0">
          {renderHighlighted()}
      </div>
      
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        spellCheck={false}
        className="w-full h-full bg-transparent text-slate-300 p-4 resize-none focus:outline-none focus:bg-slate-900/10 transition-colors z-10 relative leading-relaxed text-transparent caret-white"
        style={{ color: 'transparent' }} // Make text transparent so highlight shows through
      />
      
      <div className="absolute top-2 right-2 px-2 py-1 bg-slate-800 text-[9px] text-slate-500 rounded uppercase font-bold border border-slate-700 pointer-events-none z-20">
        {language.toUpperCase()}
      </div>
    </div>
  );
};
