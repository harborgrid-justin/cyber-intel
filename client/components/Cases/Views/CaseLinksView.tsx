
import React, { useState, useMemo } from 'react';
import { Case } from '../../../types';
import { Card, CardHeader, Button, Input, Badge } from '../../Shared/UI';
import { threatData } from 'services-frontend/dataLayer';
import { Icons } from '../../Shared/Icons';

interface Props {
  activeCase: Case;
  onLink: (targetId: string) => void;
  onUnlink: (targetId: string) => void;
}

const CaseLinksView: React.FC<Props> = ({ activeCase, onLink, onUnlink }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const allCases = threatData.getCases();
  
  const linkedCases = useMemo(() => {
    return allCases.filter(c => activeCase.linkedCaseIds?.includes(c.id));
  }, [allCases, activeCase.linkedCaseIds]);

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    const lower = searchTerm.toLowerCase();
    return allCases
      .filter(c => c.id !== activeCase.id && !activeCase.linkedCaseIds?.includes(c.id))
      .filter(c => c.title.toLowerCase().includes(lower) || c.id.toLowerCase().includes(lower))
      .slice(0, 5);
  }, [searchTerm, allCases, activeCase.id, activeCase.linkedCaseIds]);

  const navigateToCase = (id: string) => {
      // Dispatch event to parent CaseBoard to switch view
      const event = new CustomEvent('case-selected', { detail: { id } });
      window.dispatchEvent(event);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Linked List */}
        <Card className="p-0 overflow-hidden flex flex-col h-full">
            <CardHeader 
                title="Linked Operations" 
                action={<Badge color="blue">{linkedCases.length} Connected</Badge>} 
            />
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                {linkedCases.length > 0 ? linkedCases.map(c => (
                    <div key={c.id} className="p-3 bg-slate-900 border border-slate-800 rounded hover:border-cyan-500 transition-colors flex justify-between items-center group">
                        <div className="flex-1 cursor-pointer" onClick={() => navigateToCase(c.id)}>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs text-cyan-500 font-bold">{c.id}</span>
                                <Badge color={c.status === 'CLOSED' ? 'slate' : 'green'}>{c.status}</Badge>
                            </div>
                            <div className="font-bold text-white text-sm">{c.title}</div>
                        </div>
                        <Button onClick={() => onUnlink(c.id)} variant="text" className="text-slate-500 hover:text-red-500">
                            <Icons.UserX className="w-4 h-4" /> {/* Reusing icon as Unlink */}
                        </Button>
                    </div>
                )) : <div className="text-center text-slate-500 italic py-8">No related cases linked.</div>}
            </div>
        </Card>

        {/* Search & Add */}
        <Card className="p-0 overflow-hidden h-fit">
            <CardHeader title="Connect Cases" />
            <div className="p-6">
                <div className="mb-4">
                    <Input 
                        placeholder="Search by Case ID or Title..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                    />
                </div>
                <div className="space-y-2">
                    {searchResults.map(c => (
                        <div key={c.id} className="flex justify-between items-center p-2 hover:bg-slate-900 rounded cursor-pointer border border-transparent hover:border-slate-800">
                            <div>
                                <div className="text-xs text-cyan-500 font-mono">{c.id}</div>
                                <div className="text-sm text-slate-300 line-clamp-1">{c.title}</div>
                            </div>
                            <Button onClick={() => { onLink(c.id); setSearchTerm(''); }} variant="secondary" className="text-[10px] py-1">LINK</Button>
                        </div>
                    ))}
                    {searchTerm && searchResults.length === 0 && (
                        <div className="text-xs text-slate-500 text-center">No connectable cases found.</div>
                    )}
                </div>
            </div>
        </Card>
    </div>
  );
};

export default CaseLinksView;
