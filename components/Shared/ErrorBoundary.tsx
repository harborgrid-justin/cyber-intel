
import React, { Component, ErrorInfo, ReactNode } from 'react';
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

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Runtime Error Caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public handleReset = () => {
    // Check error before clearing state
    const currentError = this.state.error;
    
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Force hard reload if it's likely a hot-module or initialization issue
    if (currentError?.message?.includes("null") || currentError?.message?.includes("Dispatcher")) {
        window.location.reload();
    }
  }

  public render() {
    if (this.state.hasError) {
      const isDispatcherError = this.state.error?.message?.includes("useRef") || this.state.error?.message?.includes("Dispatcher") || this.state.error?.message?.includes("null");

      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 overflow-auto">
          <Card className="max-w-2xl w-full p-8 border-red-500 bg-slate-900 shadow-2xl relative overflow-hidden">
            
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
                <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20">
                    <Icons.AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-wide">System Exception</h1>
                    <p className="text-sm text-slate-400">The application encountered a critical runtime error.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-black/50 p-4 rounded border border-red-900/30">
                    <div className="text-[10px] uppercase font-bold text-red-400 mb-2">Error Message</div>
                    <code className="text-white font-mono text-sm block break-all">
                        {this.state.error?.toString()}
                    </code>
                </div>

                {isDispatcherError && (
                    <div className="bg-blue-900/10 p-3 rounded border border-blue-900/30 text-blue-300 text-xs">
                        <strong>Diagnosis:</strong> This error typically indicates a React version mismatch (Duplicate React instances). The application import map has been corrected. Please reload.
                    </div>
                )}
                
                {this.state.errorInfo && (
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 overflow-auto max-h-[30vh]">
                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">Stack Trace</div>
                        <pre className="text-slate-400 font-mono text-[10px] whitespace-pre-wrap leading-relaxed select-all">
                            {this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                 <Button onClick={() => window.location.reload()} variant="primary" className="px-6">
                    RELOAD SYSTEM
                 </Button>
                 <Button onClick={this.handleReset} variant="secondary">
                    TRY RECOVERY
                 </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
