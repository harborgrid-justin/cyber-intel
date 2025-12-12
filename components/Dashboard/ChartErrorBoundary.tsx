
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '../Shared/UI';
import { TOKENS } from '../../styles/theme';

interface ChartErrorBoundaryProps {
  children: ReactNode;
  chartName?: string;
  fallback?: ReactNode;
}

interface ChartErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary for Chart Components
 * Handles React 19 error boundary improvements and recharts errors gracefully
 */
class ChartErrorBoundary extends Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ChartErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Chart Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Log to error tracking service if available
    if (typeof window !== 'undefined' && (window as any).errorTracker) {
      (window as any).errorTracker.logError({
        component: this.props.chartName || 'UnknownChart',
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, chartName = 'Chart', fallback } = this.props;
    const CHARTS = TOKENS.dark.charts;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <Card className="shadow-lg h-96 p-0 overflow-hidden flex flex-col">
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center px-6 py-8 max-w-md">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-lg font-bold text-[var(--colors-textPrimary)] mb-2">
                {chartName} Error
              </h3>
              <p className="text-sm text-[var(--colors-error)] mb-4">
                {error?.message || 'An unexpected error occurred while rendering the chart'}
              </p>
              <p className="text-xs text-[var(--colors-textSecondary)] mb-6">
                This could be due to data formatting issues or a temporary rendering problem.
              </p>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded text-sm font-medium transition-colors"
                style={{
                  backgroundColor: CHARTS.primary,
                  color: '#fff'
                }}
              >
                Try Again
              </button>
              {process.env.NODE_ENV === 'development' && error && (
                <details className="mt-6 text-left">
                  <summary className="text-xs text-[var(--colors-textSecondary)] cursor-pointer hover:text-[var(--colors-textPrimary)]">
                    View Error Details
                  </summary>
                  <pre className="mt-2 p-3 bg-[var(--colors-surfaceRaised)] rounded text-xs overflow-auto max-h-48">
                    <code className="text-[var(--colors-error)]">
                      {error.stack}
                    </code>
                  </pre>
                </details>
              )}
            </div>
          </div>
        </Card>
      );
    }

    return children;
  }
}

export default ChartErrorBoundary;
