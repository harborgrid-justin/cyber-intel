
import React, { useState } from 'react';
import { Button } from './UI';
import { Icons } from './Icons';

interface Props { children: React.ReactNode; title: string; }

export const PipContainer: React.FC<Props> = ({ children, title }) => {
  const [isPip, setIsPip] = useState(false);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  const togglePip = async () => {
    if (isPip && pipWindow) {
      pipWindow.close(); // Will trigger 'pagehide'
    } else {
      if ('documentPictureInPicture' in window) {
        const pip = await (window as any).documentPictureInPicture.requestWindow({
          width: 400, height: 300
        });
        setPipWindow(pip);
        setIsPip(true);
        
        // Move content
        const container = document.getElementById('pip-content');
        if (container) pip.document.body.append(container);

        pip.addEventListener('pagehide', () => {
          setIsPip(false);
          setPipWindow(null);
          // React Portal logic normally handles moving back, 
          // or simple re-render if using conditional rendering
          const root = document.getElementById('pip-placeholder');
          if (container && root) root.append(container);
        });
      } else {
          alert("PiP not supported in this browser.");
      }
    }
  };

  return (
    <div id="pip-placeholder" className="relative border border-slate-800 rounded bg-slate-900 p-1">
      <div className="flex justify-between items-center p-2 bg-slate-950 border-b border-slate-800 mb-2">
         <span className="text-xs font-bold text-slate-400 uppercase">{title}</span>
         <button onClick={togglePip} className="text-slate-500 hover:text-white">
            <Icons.Monitor className="w-4 h-4" />
         </button>
      </div>
      <div id="pip-content" className="h-full min-h-[100px]">
        {children}
      </div>
    </div>
  );
};
