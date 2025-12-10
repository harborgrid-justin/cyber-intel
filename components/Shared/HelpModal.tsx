
import React from 'react';
import Modal from './Modal';
import { useDataStore } from '../../hooks/useDataStore';
import { threatData } from '../../services/dataLayer';

export const HelpModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const config = useDataStore(() => threatData.getAppConfig());

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${config.appName} Help`}>
      <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>Welcome to {config.appName} Core.</p>
          <p>This platform provides unified threat intelligence, case management, and response orchestration for {config.orgName}.</p>
          <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <strong>Support Contact:</strong><br/>
              Email: {config.supportEmail || 'N/A'}<br/>
              Hotline: {config.supportPhone || 'N/A'} (Secure Line)
          </div>
      </div>
    </Modal>
  );
};
