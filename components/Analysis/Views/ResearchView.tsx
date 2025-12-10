
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, Input, Button } from '../../Shared/UI';
import { Icons } from '../../Shared/Icons';
import { PrefixTrie } from '../../services/algorithms/Trie';
import { threatData } from '../../../services/dataLayer';

export const ResearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const corpus = threatData.getResearchCorpus();
  
  const trie = useMemo(() => {
      const t = new PrefixTrie();
      corpus.forEach(w => t.insert(w, w));
      return t;
  }, [corpus]);

  useEffect(() => {
      if (query.length > 1) {
          setSuggestions(trie.searchPrefix(query));
      } else {
          setSuggestions([]);
      }
  }, [query, trie]);

  const handleResearch = () => {
    setResults([`Analysis for "${query}" complete. Found 3 matches in global intelligence feeds.`]);
    setSuggestions([]);
  };

  return (
    <Card className="h-full p-0 overflow-hidden flex flex-col">
        <CardHeader title="Deep Research Assistant" />
        <div className="p-6 space-y-6 flex-1 flex flex-col">
            <div className="relative">
                <div className="flex gap-2">
                    <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Enter research topic..." className="flex-1" />
                    <Button onClick={handleResearch}>INITIATE</Button>
                </div>
                {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-slate-900 border border-slate-700 rounded mt-1 z-10 shadow-xl">
                        {suggestions.map(s => (
                            <div key={s} className="p-2 hover:bg-slate-800 cursor-pointer text-sm text-slate-300" onClick={() => setQuery(s)}>
                                {s}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="flex-1 bg-slate-950 rounded border border-slate-800 p-4 font-mono text-sm">
                <ul className="space-y-2">
                    {results.map((r, i) => <li key={i} className="text-slate-300"><span className="text-cyan-500">[{i+1}]</span> {r}</li>)}
                </ul>
            </div>
        </div>
    </Card>
  );
};
