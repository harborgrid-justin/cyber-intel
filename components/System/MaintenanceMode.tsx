import React from 'react';
import { Icons } from '../Shared/Icons';

export const MaintenanceMode: React.FC = () => (
  <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col items-center justify-center text-center p-8">
    <Icons.Tool className="w-16 h-16 text-yellow-500 animate-spin-slow mb-4" />
    <h1 className="text-2xl font-bold text-white mb-2">SYSTEM MAINTENANCE</h1>
    <p className="text-slate-400">Scheduled upgrades in progress. Please stand by.</p>
  </div>
);