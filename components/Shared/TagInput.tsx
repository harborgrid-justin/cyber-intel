
import React, { useState } from 'react';
import { Icons } from './Icons';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export const TagInput: React.FC<TagInputProps> = ({ tags, onChange, placeholder = "Add tag..." }) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        onChange([...tags, input.trim()]);
      }
      setInput('');
    }
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag));
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-slate-950 border border-slate-800 rounded min-h-[42px]">
      {tags.map(tag => (
        <span key={tag} className="flex items-center gap-1 bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded">
          {tag}
          <button onClick={() => removeTag(tag)} className="hover:text-white"><Icons.UserX className="w-3 h-3" /></button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="bg-transparent outline-none text-sm text-white flex-1 min-w-[80px]"
      />
    </div>
  );
};
