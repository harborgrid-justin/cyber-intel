
import React from 'react';
import { Icons } from './Icons';
import { Button } from './UI';

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<Props> = ({ title = "Error Loading Data", message = "An unexpected error occurred.", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
      <div className="w-12 h-12 bg-red-900/20 rounded-full flex items-center justify-center mb-4 text-red-500">
        <Icons.AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm mb-6 max-w-md">{message}</p>
      {onRetry && <Button onClick={onRetry} variant="secondary">Try Again</Button>}
    </div>
  );
};
