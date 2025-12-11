
import React, { useState, useMemo } from 'react';
import { threatData } from '../../services/dataLayer';
import { StandardPage } from '../Shared/Layouts';
import { Card, Button, CardHeader, Badge } from '../Shared/UI';
import ChatInterface from '../Shared/ChatInterface';
import AttributionEngine from './AttributionEngine';
import { IntelTools } from './Views/IntelTools';
import { TriageView } from './Views/TriageView';
import { View } from '../../types';
import { useIntelChat } from '../../hooks/modules/useIntelChat';

const IntelAssistant: React.FC = () => {
  const modules = useMemo(() => threatData.getModulesForView(View.ANALYSIS), []);
  const [activeModule, setActiveModule] = useState(modules[0]);
  
  // Extracted logic hook
  const { messages, loading, handleSend, aiConfig, createCaseFromChat } = useIntelChat();

  return (
    <StandardPage
      title="AI Threat Analyst"
      subtitle={`Powered by ${aiConfig.modelName}`}
      actions={<Button onClick={createCaseFromChat}>Create Case from Session</Button>}
      modules={modules}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
    >
      {activeModule === 'Chat' && (
        <Card className="flex-1 flex flex-col min-h-0 p-0 border-slate-800 h-full overflow-hidden">
          <CardHeader title="AI Analyst Session" action={<Badge color="purple">{aiConfig.modelName.toUpperCase()}</Badge>} />
          <ChatInterface 
            messages={messages} 
            onSend={handleSend} 
            isLoading={loading} 
            placeholder="Query threat intelligence..." 
            className="flex-1 border-0 rounded-none h-full bg-slate-900/50" 
          />
        </Card>
      )}
      
      {activeModule === 'Attribution' && <AttributionEngine />}
      
      {activeModule === 'Triage' && <TriageView />}
      
      {['Decryption', 'Translation', 'Summary'].includes(activeModule) && <IntelTools />}

      {!['Chat', 'Attribution', 'Triage', 'Decryption', 'Translation', 'Summary'].includes(activeModule) && (
        <Card className="flex-1 flex items-center justify-center text-slate-500 uppercase tracking-widest p-12">
          {activeModule} Module Interface
        </Card>
      )}
    </StandardPage>
  );
};
export default IntelAssistant;
