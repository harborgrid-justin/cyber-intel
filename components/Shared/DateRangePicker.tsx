
import React from 'react';
import { Input } from './UI';

interface Props {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
}

export const DateRangePicker: React.FC<Props> = ({ start, end, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <Input type="date" value={start} onChange={e => onChange(e.target.value, end)} className="w-32 text-xs" />
      <span className="text-slate-500">-</span>
      <Input type="date" value={end} onChange={e => onChange(start, e.target.value)} className="w-32 text-xs" />
    </div>
  );
};
