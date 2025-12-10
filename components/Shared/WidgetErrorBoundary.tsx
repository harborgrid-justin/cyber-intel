import React, { ErrorInfo, ReactNode } from 'react';
import { Icons } from './Icons';
import { Button } from './UI';

interface Props {
  children?: ReactNode;
  title?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// FIX: Extended React.Component directly to ensure this is a proper React class component.
// This resolves errors where `this.props` and `this.setState` were not found.
export class WidgetErrorBoundary extends React.Component<Props, State> {
  state: State = { 
    hasError: false, 
    error: null 
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn(`Widget Error (${this.props.title}):`, error, errorInfo);
  }

  public handleRetry = () => {
    this.setState({ hasError: false, error: null });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded p-4 text-center">
          <Icons.AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
          <h4 className="text-sm font-bold text-slate-300 uppercase">{this.props.title || 'Widget Failed'}</h4>
          <p className="text-[10px] text-slate-500 mb-3 max-w-[200px] truncate">{this.state.error?.message}</p>
          <Button onClick={this.handleRetry} variant="secondary" className="text-[10px] py-1 h-6">RETRY</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
