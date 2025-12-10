
import React, { ErrorInfo, ReactNode } from 'react';
import { Card, Button } from './UI';
import { Icons } from './Icons';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// FIX: This class must extend React.Component to be a valid React class component.
// This provides access to lifecycle methods, `this.props`, and `this.setState`.
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // FIX: Property 'setState' does not exist on type 'ErrorBoundary'. Add `extends React.Component` to fix.
    this.setState({ errorInfo });
  }

  public handleReset = () => {
    // FIX: Property 'setState' does not exist on type 'ErrorBoundary'. Add `extends React.Component` to fix.
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 overflow-auto">
          <Card className="max-w-3xl w-full p-6 border-red-500 bg-slate-900 shadow-2xl">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-red-500 border-b border-red-900/30 pb-4">
                <Icons.AlertTriangle className="w-10 h-10" />
                <div>
                    <h1 className="text-xl font-bold uppercase tracking-widest">Critical Render Error</h1>
                    <p className="text-xs text-red-400">The application encountered an unexpected state.</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-white font-bold text-lg font-mono bg-slate-950 p-2 rounded border border-slate-800">
                    {this.state.error?.toString()}
                </h2>
                
                <div className="bg-black p-4 rounded border border-slate-800 overflow-auto max-h-[60vh]">
                    <div className="text-slate-500 text-xs font-bold uppercase mb-2">Stack Trace</div>
                    <pre className="text-red-400 font-mono text-xs whitespace-pre-wrap leading-relaxed select-all">
                        {this.state.errorInfo?.componentStack || this.state.error?.stack || "No stack trace available"}
                    </pre>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                 <Button onClick={() => window.location.reload()} variant="secondary">
                    FULL PAGE RELOAD
                 </Button>
                 <Button onClick={this.handleReset} variant="danger">
                    ATTEMPT RECOVERY
                 </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // FIX: Property 'props' does not exist on type 'ErrorBoundary'. Add `extends React.Component` to fix.
    return this.props.children;
  }
}