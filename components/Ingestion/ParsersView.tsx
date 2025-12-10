
import React, { useState } from 'react';
import { Card, Button, CardHeader } from '../Shared/UI';
import { ParserRule } from '../../types';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';
import { ParserRuleCard } from './views/ParserRuleCard';

interface TestResult {
  success: boolean;
  message: string;
  groups?: string[];
}

const ParsersView: React.FC = () => {
  const parsers = useDataStore(() => threatData.getParserRules());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const toggleStatus = (parser: ParserRule) => {
    threatData.updateParserRule({ ...parser, status: parser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
  };

  const analyzePerformance = (pattern: string): 'FAST' | 'MODERATE' | 'SLOW' => {
    if (pattern.includes('.*') && pattern.length < 15) return 'SLOW'; // "Evil regex" heuristic
    if (pattern.length > 100) return 'MODERATE';
    return 'FAST';
  };

  const handleTest = (parser: ParserRule) => {
    try {
      const regex = new RegExp(parser.pattern);
      const match = regex.exec(parser.sampleLog);
      if (match) {
        setTestResult({ success: true, message: `Match Successful.`, groups: Array.from(match).slice(1) });
      } else {
        setTestResult({ success: false, message: 'No match found in sample log.' });
      }
    } catch (e) {
      setTestResult({ success: false, message: 'Invalid Regex Syntax.' });
    }
  };

  const updateParser = (parser: ParserRule, field: keyof ParserRule, value: string) => {
    const updated = { ...parser, [field]: value };
    if (field === 'pattern') updated.performance = analyzePerformance(value);
    threatData.updateParserRule(updated);
    setTestResult(null);
  };

  return (
    <Card className="p-0 overflow-hidden flex flex-col h-full">
      <CardHeader 
        title="Log Extraction Rules" 
        action={<Button onClick={() => alert("New Parser Wizard")} className="text-[10px] py-1">+ NEW PARSER</Button>}
      />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {parsers.map(parser => (
            <ParserRuleCard
                key={parser.id}
                parser={parser}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
                testResult={testResult}
                handleTest={handleTest}
                toggleStatus={toggleStatus}
                updateParser={updateParser}
            />
        ))}
      </div>
    </Card>
  );
};

export default ParsersView;
