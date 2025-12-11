
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { View } from '../../types';
import { ClassificationBanner, SystemUseNotification, AuditFooter } from '../Shared/ComplianceComponents';
import { STYLES } from '../../styles/theme';
import CommandPalette from '../Shared/CommandPalette';
import LockScreen from './LockScreen';
import { NotificationToast } from '../Shared/NotificationSystem';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onNavigate: (view: View) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);

  useEffect(() => {
    const handleNotif = (e: CustomEvent) => {
        const id = Date.now();
        setToasts(prev => [...prev, { ...e.detail, id }]);
        setTimeout(() => setToasts(curr => curr.filter(t => t.id !== id)), 5000);
    };
    window.addEventListener('notification', handleNotif as EventListener);
    return () => window.removeEventListener('notification', handleNotif as EventListener);
  }, []);

  const handleSidebarNavigate = useCallback((view: View) => {
    onNavigate(view);
    setSidebarOpen(false);
  }, [onNavigate]);

  return (
    <div className={STYLES.app_container}>
      <LockScreen />
      <CommandPalette />
      <SystemUseNotification />
      <ClassificationBanner position="top" />
      
      <div className="fixed top-20 right-6 z-[var(--zIndex-toast)] flex flex-col items-end pointer-events-none">
        <div className="pointer-events-auto">{toasts.map(t => (<NotificationToast key={t.id} notification={t} onClose={() => setToasts(curr => curr.filter(x => x.id !== t.id))} />))}</div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar currentView={currentView} onNavigate={handleSidebarNavigate} />
        {sidebarOpen && <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[var(--zIndex-modalBackdrop)] md:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent relative z-0">
          <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto scroll-smooth flex flex-col relative custom-scrollbar">{children}</main>
        </div>
      </div>
      
      <ClassificationBanner position="bottom" />
      <AuditFooter />
    </div>
  );
};
export default Layout;
