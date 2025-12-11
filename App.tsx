
import React, { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import ThreatFeed from './components/Feed/ThreatFeed';
import { View } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');

  const renderView = () => {
    switch(currentView) {
        case 'DASHBOARD': return <Dashboard />;
        case 'FEED': return <ThreatFeed />;
        case 'CASES': return <div className="p-8 text-slate-500">Case Management Module Loading...</div>;
        case 'ANALYSIS': return <div className="p-8 text-slate-500">AI Analysis Module Loading...</div>;
        default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      <main className="flex-1 flex flex-col overflow-hidden relative bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950 to-slate-950">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-transparent opacity-30"></div>
        {renderView()}
      </main>
    </div>
  );
};

export default App;
