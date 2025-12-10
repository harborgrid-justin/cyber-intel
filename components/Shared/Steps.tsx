
import React, { ReactElement } from 'react';

interface StepProps {
  title: string;
  children: React.ReactNode;
}

export const Step: React.FC<StepProps> = ({ children }) => <>{children}</>;

interface StepsProps {
  currentStep: number;
  children: ReactElement<StepProps>[];
}

export const Steps: React.FC<StepsProps> = ({ currentStep, children }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Stepper Header */}
      <div className="flex justify-between items-center mb-6 px-4">
        {React.Children.map(children, (child, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <div className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold transition-all
                ${isActive ? 'border-cyan-500 text-cyan-500 bg-cyan-900/20' : 
                  isCompleted ? 'border-green-500 bg-green-500 text-white' : 
                  'border-slate-700 text-slate-500 bg-slate-900'}
              `}>
                {isCompleted ? '✓' : index + 1}
              </div>
              <span className={`ml-2 text-xs uppercase font-bold hidden md:block ${isActive ? 'text-white' : 'text-slate-600'}`}>
                {child.props.title}
              </span>
              {index < React.Children.count(children) - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-slate-800'}`}></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-6 overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-300 key={currentStep}">
        {React.Children.toArray(children)[currentStep]}
      </div>
    </div>
  );
};
