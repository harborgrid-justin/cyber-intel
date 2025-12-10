
import React, { useRef, useState } from 'react';
import { Icons } from './Icons';

interface Props {
  onFileSelect: (file: File) => void;
  accept?: string;
}

export const FileUploadZone: React.FC<Props> = ({ onFileSelect, accept }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging ? 'border-cyan-500 bg-cyan-900/10' : 'border-slate-700 bg-slate-900/50 hover:border-slate-500'}`}
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" className="hidden" accept={accept} onChange={e => e.target.files?.[0] && onFileSelect(e.target.files[0])} />
      <Icons.FileText className={`w-10 h-10 mb-3 ${isDragging ? 'text-cyan-500' : 'text-slate-500'}`} />
      <div className="text-sm font-bold text-slate-300">Click or Drag file to upload</div>
      <div className="text-xs text-slate-500 mt-1">{accept || 'All file types supported'}</div>
    </div>
  );
};
