
import React from 'react';
import { Button } from './UI';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<Props> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-900">
      <div className="text-xs text-slate-500">Page {currentPage} of {totalPages}</div>
      <div className="flex gap-2">
        <Button 
            disabled={currentPage <= 1} 
            onClick={() => onPageChange(currentPage - 1)}
            variant="secondary"
            className="text-xs py-1"
        >
            Previous
        </Button>
        <Button 
            disabled={currentPage >= totalPages} 
            onClick={() => onPageChange(currentPage + 1)}
            variant="secondary"
            className="text-xs py-1"
        >
            Next
        </Button>
      </div>
    </div>
  );
};
