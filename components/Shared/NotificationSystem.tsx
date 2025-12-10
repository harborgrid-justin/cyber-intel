
import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { AppBadge } from '../../services/notifications/AppBadge';
import { EXECUTIVE_THEME, TOKENS } from '../../styles/theme';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  timestamp: number;
}

export const NotificationToast: React.FC<{ notification: Notification; onClose: () => void }> = ({ notification, onClose }) => {
  const colorMap = {
    info: { main: 'info', dim: 'infoDim' },
    warning: { main: 'warning', dim: 'warningDim' },
    critical: { main: 'error', dim: 'errorDim' },
    success: { main: 'success', dim: 'successDim' },
  };
  const theme = colorMap[notification.type];

  return (
    <div 
        className={`mb-3 w-80 p-4 rounded shadow-2xl border-l-4 backdrop-blur-md cursor-pointer animate-in slide-in-from-right duration-300 border-y border-r border-[var(--colors-borderDefault)] bg-[var(--colors-${theme.dim})] border-l-[var(--colors-${theme.main})]`}
        onClick={onClose}
    >
      <div className="flex justify-between items-start">
        <h4 className={`font-bold text-sm uppercase tracking-wide text-[var(--colors-${theme.main})]`}>{notification.title}</h4>
        <span className="text-[10px] opacity-70">Just now</span>
      </div>
      <p className="text-xs mt-1 opacity-90">{notification.message}</p>
    </div>
  );
};

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const handleEvent = (e: CustomEvent) => {
        const notif: Notification = {
            id: Date.now().toString(),
            title: e.detail.title || 'System Alert',
            message: e.detail.message || 'Event triggered',
            type: e.detail.type || 'info',
            timestamp: Date.now()
        };
        setNotifications(prev => [notif, ...prev]);
        setUnread(u => {
            const newVal = u + 1;
            AppBadge.set(newVal); // Update Desktop Badge
            return newVal;
        });
    };
    
    window.addEventListener('notification', handleEvent as EventListener);
    return () => window.removeEventListener('notification', handleEvent as EventListener);
  }, []);

  const handleOpen = () => {
      setIsOpen(!isOpen);
      setUnread(0);
      AppBadge.clear(); // Clear Desktop Badge
  };

  return (
    <div className="relative">
      <button onClick={handleOpen} className={`relative text-[var(--colors-textTertiary)] hover:text-[var(--colors-textPrimary)] transition-colors`}>
        <Icons.Activity className="w-5 h-5" />
        {unread > 0 && <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-[var(--colors-borderDefault)]`}></span>}
      </button>

      {isOpen && (
        <>
            <div className={`fixed inset-0 z-[var(--zIndex-dropdown)]`} onClick={() => setIsOpen(false)}></div>
            <div className={`absolute right-0 mt-3 w-80 bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right`}>
                <div className={`p-3 border-b border-[var(--colors-borderSubtle)] bg-[var(--colors-surfaceRaised)] flex justify-between items-center`}>
                    <span className={`text-xs font-bold text-[var(--colors-textPrimary)] uppercase tracking-wider`}>Notifications</span>
                    <button onClick={() => setNotifications([])} className={`text-[10px] text-[var(--colors-textSecondary)] hover:text-blue-400`}>Clear All</button>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 && <div className={`p-8 text-center text-[var(--colors-textTertiary)] text-xs italic`}>All caught up.</div>}
                    {notifications.map(n => (
                        <div key={n.id} className={`p-3 border-b border-[var(--colors-borderSubtle)] hover:bg-[var(--colors-surfaceHighlight)] transition-colors`}>
                            <div className="flex justify-between mb-1">
                                <span className={`text-xs font-bold ${n.type === 'critical' ? 'text-red-400' : n.type === 'success' ? 'text-green-400' : 'text-blue-400'}`}>{n.title}</span>
                                <span className={`text-[9px] text-[var(--colors-textTertiary)]`}>{new Date(n.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className={`text-[11px] text-[var(--colors-textSecondary)] leading-tight`}>{n.message}</p>
                        </div>
                    ))}
                </div>
            </div>
        </>
      )}
    </div>
  );
};