
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { View } from '../../types';
import { ClassificationBanner, SystemUseNotification, AuditFooter } from '../Shared/ComplianceComponents';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onNavigate: (view: View) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-200">
      <SystemUseNotification />
      <ClassificationBanner position="top" />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          currentView={currentView} 
          onNavigate={(v) => { onNavigate(v); setSidebarOpen(false); }} 
          isOpen={sidebarOpen} 
        />
        
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          {/* Removed padding here to allow Layouts to control full-width headers */}
          <main className="flex-1 overflow-y-auto scroll-smooth flex flex-col relative">
            {children}
          </main>
        </div>
      </div>
      
      <ClassificationBanner position="bottom" />
      <AuditFooter />
    </div>
  );
};
export default Layout;
