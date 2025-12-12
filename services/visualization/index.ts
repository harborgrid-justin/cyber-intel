
/**
 * Visualization Service
 * Provides utilities for dashboard charts, exports, and animations
 */

import { TOKENS } from '../../styles/theme';

// Chart Color Schemes
export const ChartColors = {
  primary: TOKENS.dark.charts.primary,
  grid: TOKENS.dark.charts.grid,
  text: TOKENS.dark.charts.text,

  severity: {
    critical: TOKENS.dark.graph.threatCritical,
    high: TOKENS.dark.graph.threatHigh,
    medium: TOKENS.dark.graph.threatMedium,
    low: TOKENS.dark.charts.primary
  },

  status: {
    active: TOKENS.dark.graph.threatHigh,
    inactive: TOKENS.dark.graph.actorNode,
    success: '#10b981',
    warning: TOKENS.dark.graph.threatMedium,
    error: TOKENS.dark.graph.threatCritical
  },

  gradient: {
    primary: ['#06b6d4', '#0891b2'],
    threat: ['#ef4444', '#dc2626'],
    success: ['#10b981', '#059669'],
    warning: ['#f59e0b', '#d97706']
  },

  categorical: [
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#ef4444', // Red
    '#6366f1'  // Indigo
  ]
};

// Responsive Chart Sizing
export const ChartSizing = {
  small: {
    width: '100%',
    height: 200,
    margin: { top: 5, right: 10, bottom: 5, left: 10 }
  },
  medium: {
    width: '100%',
    height: 300,
    margin: { top: 10, right: 20, bottom: 10, left: 20 }
  },
  large: {
    width: '100%',
    height: 400,
    margin: { top: 20, right: 30, bottom: 20, left: 30 }
  },
  fullScreen: {
    width: '100%',
    height: '100vh',
    margin: { top: 40, right: 40, bottom: 40, left: 40 }
  }
};

// Animation Configurations
export const AnimationConfig = {
  default: {
    duration: 500,
    easing: 'ease-in-out'
  },
  fast: {
    duration: 200,
    easing: 'ease-out'
  },
  slow: {
    duration: 1000,
    easing: 'ease-in-out'
  },
  spring: {
    duration: 800,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  }
};

// Chart Export Utilities
export class ChartExporter {
  /**
   * Export chart as PNG image
   */
  static async exportAsPNG(chartElement: HTMLElement, filename: string = 'chart.png'): Promise<void> {
    try {
      const canvas = await this.elementToCanvas(chartElement);
      const dataUrl = canvas.toDataURL('image/png');
      this.downloadFile(dataUrl, filename);
    } catch (error) {
      console.error('Failed to export chart as PNG:', error);
      throw error;
    }
  }

  /**
   * Export chart as SVG
   */
  static exportAsSVG(chartElement: HTMLElement, filename: string = 'chart.svg'): void {
    try {
      const svgElement = chartElement.querySelector('svg');
      if (!svgElement) {
        throw new Error('No SVG element found in chart');
      }

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      this.downloadFile(url, filename);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export chart as SVG:', error);
      throw error;
    }
  }

  /**
   * Export dashboard as PDF (requires external library in production)
   */
  static async exportDashboardAsPDF(
    dashboardElement: HTMLElement,
    filename: string = 'dashboard.pdf'
  ): Promise<void> {
    // Note: This is a placeholder. In production, use a library like jsPDF or html2pdf
    console.warn('PDF export requires additional library (jsPDF or html2pdf)');
    console.log('Dashboard element:', dashboardElement);
    console.log('Filename:', filename);

    // Mock implementation
    alert('PDF export functionality requires jsPDF library. Please install it for production use.');
  }

  /**
   * Convert HTML element to canvas (for image export)
   */
  private static async elementToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
    // Note: This is a simplified version. Use html2canvas library for production
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    const rect = element.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // This is a placeholder - in production, use html2canvas
    console.warn('Canvas conversion requires html2canvas library for full functionality');

    return canvas;
  }

  /**
   * Download file helper
   */
  private static downloadFile(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Data Aggregation Utilities
export class DataAggregator {
  /**
   * Calculate moving average
   */
  static movingAverage(data: number[], window: number = 7): number[] {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - window + 1);
      const subset = data.slice(start, i + 1);
      const avg = subset.reduce((sum, val) => sum + val, 0) / subset.length;
      result.push(avg);
    }
    return result;
  }

  /**
   * Calculate percentage change
   */
  static percentageChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Group data by time period
   */
  static groupByTimePeriod<T>(
    data: T[],
    dateGetter: (item: T) => Date,
    period: 'hour' | 'day' | 'week' | 'month'
  ): Map<string, T[]> {
    const groups = new Map<string, T[]>();

    data.forEach(item => {
      const date = dateGetter(item);
      let key: string;

      switch (period) {
        case 'hour':
          key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
          break;
        case 'day':
          key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          break;
        case 'week':
          const weekNum = Math.floor(date.getDate() / 7);
          key = `${date.getFullYear()}-${date.getMonth()}-W${weekNum}`;
          break;
        case 'month':
          key = `${date.getFullYear()}-${date.getMonth()}`;
          break;
      }

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    });

    return groups;
  }

  /**
   * Calculate trend (linear regression)
   */
  static calculateTrend(data: number[]): { slope: number; intercept: number; predicted: number[] } {
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    data.forEach((y, x) => {
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const predicted = data.map((_, x) => slope * x + intercept);

    return { slope, intercept, predicted };
  }
}

// Chart Formatting Utilities
export class ChartFormatter {
  /**
   * Format large numbers (e.g., 1000 -> 1K)
   */
  static formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * Format percentage
   */
  static formatPercentage(num: number, decimals: number = 1): string {
    return num.toFixed(decimals) + '%';
  }

  /**
   * Format timestamp for chart labels
   */
  static formatTimestamp(date: Date, format: 'time' | 'date' | 'datetime' = 'datetime'): string {
    switch (format) {
      case 'time':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case 'date':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'datetime':
        return date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
    }
  }

  /**
   * Format duration (milliseconds to human readable)
   */
  static formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}

// Export all utilities
export default {
  ChartColors,
  ChartSizing,
  AnimationConfig,
  ChartExporter,
  DataAggregator,
  ChartFormatter
};
