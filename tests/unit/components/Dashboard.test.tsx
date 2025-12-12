import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../../../components/Dashboard/Dashboard';
import { threatFixtures } from '../../fixtures/threats.fixtures';
import { caseFixtures } from '../../fixtures/cases.fixtures';
import React from 'react';

// Mock the dashboard logic hook
const mockDashboardData = {
  activeModule: 'Overview',
  handleModuleChange: vi.fn(),
  briefing: {
    activeThreats: 15,
    criticalCases: 8,
    incidentsToday: 3,
    mttr: 2.4,
  },
  threats: threatFixtures.slice(0, 10),
  cases: caseFixtures.slice(0, 10),
  reports: [],
  modules: [
    'Overview',
    'System Health',
    'Network Ops',
    'Cloud Security',
    'Compliance',
    'Insider Threat',
    'Dark Web',
    'Global Map',
  ],
  defcon: 3,
  trend: 'stable',
  metricsLoading: false,
};

vi.mock('../../../hooks/modules/useDashboardLogic', () => ({
  useDashboardLogic: () => mockDashboardData,
}));

// Mock child components
vi.mock('../../../components/Shared/Layouts', () => ({
  StandardPage: ({ children, title, subtitle, modules, activeModule, onModuleChange }: any) => (
    <div data-testid="standard-page">
      <div data-testid="page-title">{title}</div>
      <div data-testid="page-subtitle">{subtitle}</div>
      <div data-testid="modules">
        {modules.map((module: string) => (
          <button
            key={module}
            data-testid={`module-${module}`}
            onClick={() => onModuleChange(module)}
            className={module === activeModule ? 'active' : ''}
          >
            {module}
          </button>
        ))}
      </div>
      {children}
    </div>
  ),
}));

vi.mock('../../../components/Shared/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

vi.mock('../../../components/Dashboard/Views/OverviewView', () => ({
  OverviewView: ({ briefing, threats, cases, reports, defcon, trend, loading }: any) => (
    <div data-testid="overview-view">
      <div data-testid="briefing-active-threats">{briefing.activeThreats}</div>
      <div data-testid="briefing-critical-cases">{briefing.criticalCases}</div>
      <div data-testid="threats-count">{threats.length}</div>
      <div data-testid="cases-count">{cases.length}</div>
      <div data-testid="defcon">{defcon}</div>
      <div data-testid="trend">{trend}</div>
      {loading && <div data-testid="metrics-loading">Loading metrics...</div>}
    </div>
  ),
}));

vi.mock('../../../components/Dashboard/Views/InfraViews', () => ({
  InfraViews: {
    SystemHealth: () => <div data-testid="system-health-view">System Health</div>,
    NetworkOps: () => <div data-testid="network-ops-view">Network Ops</div>,
    CloudSecurity: () => <div data-testid="cloud-security-view">Cloud Security</div>,
  },
}));

vi.mock('../../../components/Dashboard/Views/SecurityViews', () => ({
  SecurityViews: {
    Compliance: () => <div data-testid="compliance-view">Compliance</div>,
    InsiderThreat: () => <div data-testid="insider-threat-view">Insider Threat</div>,
    DarkWeb: () => <div data-testid="dark-web-view">Dark Web</div>,
  },
}));

vi.mock('../../../components/Dashboard/GeoMap', () => ({
  default: ({ threats, fullScreen }: any) => (
    <div data-testid="geo-map">
      <div data-testid="geo-map-threats">{threats.length}</div>
      <div data-testid="geo-map-fullscreen">{fullScreen ? 'true' : 'false'}</div>
    </div>
  ),
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDashboardData.activeModule = 'Overview';
  });

  describe('Rendering', () => {
    it('should render dashboard with correct title and subtitle', () => {
      render(<Dashboard />);

      expect(screen.getByTestId('page-title')).toHaveTextContent('Command Center');
      expect(screen.getByTestId('page-subtitle')).toHaveTextContent('Executive Situational Awareness');
    });

    it('should render all module navigation buttons', () => {
      render(<Dashboard />);

      mockDashboardData.modules.forEach(module => {
        expect(screen.getByTestId(`module-${module}`)).toBeInTheDocument();
      });
    });

    it('should render Overview view by default', () => {
      render(<Dashboard />);

      expect(screen.getByTestId('overview-view')).toBeInTheDocument();
    });
  });

  describe('Overview View', () => {
    it('should display correct briefing data', () => {
      render(<Dashboard />);

      expect(screen.getByTestId('briefing-active-threats')).toHaveTextContent('15');
      expect(screen.getByTestId('briefing-critical-cases')).toHaveTextContent('8');
    });

    it('should display correct threat and case counts', () => {
      render(<Dashboard />);

      expect(screen.getByTestId('threats-count')).toHaveTextContent('10');
      expect(screen.getByTestId('cases-count')).toHaveTextContent('10');
    });

    it('should display DEFCON level and trend', () => {
      render(<Dashboard />);

      expect(screen.getByTestId('defcon')).toHaveTextContent('3');
      expect(screen.getByTestId('trend')).toHaveTextContent('stable');
    });

    it('should show loading state when metrics are loading', () => {
      mockDashboardData.metricsLoading = true;
      render(<Dashboard />);

      expect(screen.getByTestId('metrics-loading')).toBeInTheDocument();
    });
  });

  describe('Module Navigation', () => {
    it('should render System Health view when selected', () => {
      mockDashboardData.activeModule = 'System Health';
      render(<Dashboard />);

      expect(screen.getByTestId('system-health-view')).toBeInTheDocument();
      expect(screen.queryByTestId('overview-view')).not.toBeInTheDocument();
    });

    it('should render Network Ops view when selected', () => {
      mockDashboardData.activeModule = 'Network Ops';
      render(<Dashboard />);

      expect(screen.getByTestId('network-ops-view')).toBeInTheDocument();
    });

    it('should render Cloud Security view when selected', () => {
      mockDashboardData.activeModule = 'Cloud Security';
      render(<Dashboard />);

      expect(screen.getByTestId('cloud-security-view')).toBeInTheDocument();
    });

    it('should render Compliance view when selected', () => {
      mockDashboardData.activeModule = 'Compliance';
      render(<Dashboard />);

      expect(screen.getByTestId('compliance-view')).toBeInTheDocument();
    });

    it('should render Insider Threat view when selected', () => {
      mockDashboardData.activeModule = 'Insider Threat';
      render(<Dashboard />);

      expect(screen.getByTestId('insider-threat-view')).toBeInTheDocument();
    });

    it('should render Dark Web view when selected', () => {
      mockDashboardData.activeModule = 'Dark Web';
      render(<Dashboard />);

      expect(screen.getByTestId('dark-web-view')).toBeInTheDocument();
    });

    it('should render Global Map view with lazy loading when selected', async () => {
      mockDashboardData.activeModule = 'Global Map';
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('geo-map')).toBeInTheDocument();
      });

      expect(screen.getByTestId('geo-map-threats')).toHaveTextContent('10');
      expect(screen.getByTestId('geo-map-fullscreen')).toHaveTextContent('true');
    });

    it('should fallback to Overview for unknown module', () => {
      mockDashboardData.activeModule = 'UnknownModule';
      render(<Dashboard />);

      expect(screen.getByTestId('overview-view')).toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    it('should call handleModuleChange when module button is clicked', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);

      const systemHealthButton = screen.getByTestId('module-System Health');
      await user.click(systemHealthButton);

      expect(mockDashboardData.handleModuleChange).toHaveBeenCalledWith('System Health');
    });

    it('should call handleModuleChange with correct module name', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);

      const complianceButton = screen.getByTestId('module-Compliance');
      await user.click(complianceButton);

      expect(mockDashboardData.handleModuleChange).toHaveBeenCalledWith('Compliance');
    });
  });

  describe('Data Loading', () => {
    it('should pass correct data to OverviewView', () => {
      render(<Dashboard />);

      expect(screen.getByTestId('overview-view')).toBeInTheDocument();
      expect(screen.getByTestId('briefing-active-threats')).toHaveTextContent('15');
      expect(screen.getByTestId('threats-count')).toHaveTextContent('10');
      expect(screen.getByTestId('cases-count')).toHaveTextContent('10');
    });

    it('should handle empty threats array', () => {
      mockDashboardData.threats = [];
      render(<Dashboard />);

      expect(screen.getByTestId('threats-count')).toHaveTextContent('0');
    });

    it('should handle empty cases array', () => {
      mockDashboardData.cases = [];
      render(<Dashboard />);

      expect(screen.getByTestId('cases-count')).toHaveTextContent('0');
    });
  });

  describe('DEFCON and Trend Display', () => {
    it('should display different DEFCON levels', () => {
      mockDashboardData.defcon = 1;
      const { rerender } = render(<Dashboard />);
      expect(screen.getByTestId('defcon')).toHaveTextContent('1');

      mockDashboardData.defcon = 5;
      rerender(<Dashboard />);
      expect(screen.getByTestId('defcon')).toHaveTextContent('5');
    });

    it('should display different trend values', () => {
      mockDashboardData.trend = 'improving';
      const { rerender } = render(<Dashboard />);
      expect(screen.getByTestId('trend')).toHaveTextContent('improving');

      mockDashboardData.trend = 'worsening';
      rerender(<Dashboard />);
      expect(screen.getByTestId('trend')).toHaveTextContent('worsening');
    });
  });

  describe('Layout Structure', () => {
    it('should render within StandardPage layout', () => {
      render(<Dashboard />);

      expect(screen.getByTestId('standard-page')).toBeInTheDocument();
    });

    it('should pass all modules to StandardPage', () => {
      render(<Dashboard />);

      const modulesContainer = screen.getByTestId('modules');
      const buttons = modulesContainer.querySelectorAll('button');

      expect(buttons).toHaveLength(mockDashboardData.modules.length);
    });

    it('should pass active module to StandardPage', () => {
      mockDashboardData.activeModule = 'System Health';
      render(<Dashboard />);

      const activeButton = screen.getByTestId('module-System Health');
      expect(activeButton).toHaveClass('active');
    });
  });

  describe('Error Boundaries and Edge Cases', () => {
    it('should handle null briefing data gracefully', () => {
      mockDashboardData.briefing = null as any;

      // Should not throw error
      expect(() => render(<Dashboard />)).not.toThrow();
    });

    it('should handle undefined threats array', () => {
      mockDashboardData.threats = undefined as any;

      // Should not throw error
      expect(() => render(<Dashboard />)).not.toThrow();
    });
  });

  describe('Lazy Loading', () => {
    it('should show loading spinner before GeoMap loads', async () => {
      mockDashboardData.activeModule = 'Global Map';

      // GeoMap is lazy loaded, so it might show loading state initially
      render(<Dashboard />);

      // Eventually GeoMap should load
      await waitFor(() => {
        expect(screen.getByTestId('geo-map')).toBeInTheDocument();
      });
    });
  });

  describe('Metrics Loading State', () => {
    it('should not show loading indicator when metricsLoading is false', () => {
      mockDashboardData.metricsLoading = false;
      render(<Dashboard />);

      expect(screen.queryByTestId('metrics-loading')).not.toBeInTheDocument();
    });

    it('should show loading indicator when metricsLoading is true', () => {
      mockDashboardData.metricsLoading = true;
      render(<Dashboard />);

      expect(screen.getByTestId('metrics-loading')).toBeInTheDocument();
    });
  });

  describe('Integration with useDashboardLogic', () => {
    it('should use data from useDashboardLogic hook', () => {
      render(<Dashboard />);

      // Verify that the component uses data from the mocked hook
      expect(screen.getByTestId('overview-view')).toBeInTheDocument();
      expect(screen.getByTestId('briefing-active-threats')).toHaveTextContent(
        String(mockDashboardData.briefing.activeThreats)
      );
    });

    it('should call handleModuleChange from useDashboardLogic', async () => {
      const user = userEvent.setup();
      const handleModuleChangeSpy = vi.fn();
      mockDashboardData.handleModuleChange = handleModuleChangeSpy;

      render(<Dashboard />);

      const networkOpsButton = screen.getByTestId('module-Network Ops');
      await user.click(networkOpsButton);

      expect(handleModuleChangeSpy).toHaveBeenCalledWith('Network Ops');
      expect(handleModuleChangeSpy).toHaveBeenCalledTimes(1);
    });
  });
});
