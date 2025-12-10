
import React, { useState, useEffect } from 'react';
import { Input, Select } from './UI';
import { Icons } from './Icons';

interface SearchFilterBarProps {
  onSearch: (term: string) => void;
  searchValue: string;
  searchPlaceholder?: string;
  filters?: {
    value: string;
    onChange: (val: string) => void;
    options: { label: string; value: string }[];
    className?: string;
  }[];
  actions?: React.ReactNode;
  className?: string;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({ 
  onSearch, 
  searchValue, 
  searchPlaceholder = "Search...", 
  filters = [], 
  actions,
  className = ''
}) => {
  const [localSearch, setLocalSearch] = useState(searchValue);

  // Debounce logic: Only trigger parent onSearch after 300ms of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchValue) {
        onSearch(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearch, searchValue]);

  // Sync if parent updates searchValue externally (e.g. clear button)
  useEffect(() => {
    if (searchValue !== localSearch) {
        setLocalSearch(searchValue);
    }
  }, [searchValue]);

  return (
    <div className={`p-4 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row gap-4 items-center shrink-0 rounded-lg mb-4 ${className}`}>
      <div className="flex-1 w-full md:w-auto relative">
        <Icons.Refresh className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
        <Input 
          placeholder={searchPlaceholder}
          value={localSearch} 
          onChange={e => setLocalSearch(e.target.value)} 
          className="bg-slate-950 border-slate-800 pl-9"
        />
      </div>
      
      <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
        {filters.map((filter, i) => (
          <Select 
            key={i}
            value={filter.value} 
            onChange={e => filter.onChange(e.target.value)} 
            className={`w-full md:w-auto bg-slate-900 border-slate-800 text-xs ${filter.className || ''}`}
          >
            {filter.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        ))}
        {actions}
      </div>
    </div>
  );
};
