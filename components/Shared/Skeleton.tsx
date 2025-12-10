
import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
  const baseClass = "animate-pulse bg-slate-800/50 rounded";
  
  const variants = {
    text: "h-3 w-full my-1",
    rect: "h-full w-full",
    circle: "rounded-full"
  };

  return <div className={`${baseClass} ${variants[variant]} ${className}`} />;
};

export const CardSkeleton: React.FC = () => (
  <div className="p-4 border border-slate-800 rounded bg-slate-900/50 h-32 flex flex-col gap-3">
    <div className="flex justify-between">
      <Skeleton className="w-1/3 h-4" />
      <Skeleton variant="circle" className="w-8 h-8" />
    </div>
    <Skeleton className="w-2/3 h-3" />
    <div className="mt-auto pt-2 flex gap-2">
      <Skeleton className="flex-1 h-6" />
      <Skeleton className="flex-1 h-6" />
    </div>
  </div>
);
