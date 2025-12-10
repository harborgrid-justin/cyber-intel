
import React from 'react';

interface Props { data: unknown; }

export const JsonViewer: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-slate-950 p-4 rounded border border-slate-800 font-mono text-xs overflow-auto max-h-96 custom-scrollbar">
      <pre className="text-slate-300">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};
