
import React from 'react';
import { useDataStore } from '../../hooks/useDataStore';
import { threatData } from '../../services/dataLayer';

const Footer: React.FC = () => {
  const config = useDataStore(() => threatData.getAppConfig());

  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-2 px-6 flex justify-between items-center text-[10px] text-slate-600 font-mono shrink-0">
      <div className="flex gap-4">
        <span>v{config.version}</span>
        <span>Build: {process.env.NODE_ENV?.toUpperCase() || 'DEV'}</span>
        <span className="uppercase">{config.orgName}</span>
      </div>
      <div className="flex gap-4">
        <span className="text-green-900">SYSTEM HEALTH: OK</span>
        <span>LATENCY: 24ms</span>
      </div>
    </footer>
  );
};

export default Footer;
