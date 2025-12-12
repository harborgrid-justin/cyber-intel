
import React from 'react';
import StatCard from '../StatCard';
import RiskGauge from '../RiskGauge';
import TrendAnalysis from '../TrendAnalysis';
import ThreatHeatmap from '../ThreatHeatmap';
import ComplianceRadar from '../ComplianceRadar';

interface ExecutiveDashboardProps {
  className?: string;
}

/**
 * Executive Dashboard Layout
 * High-level KPIs and strategic overview for C-level executives
 */
const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ className = '' }) => {
  return (
    <div className={`w-full h-full overflow-y-auto ${className}`}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--colors-textPrimary)] mb-2">
            Executive Dashboard
          </h1>
          <p className="text-sm text-[var(--colors-textSecondary)]">
            Strategic security posture and risk overview
          </p>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Security Risk Score"
            value="67/100"
            trend="-5%"
            isPositive={true}
            color="primary"
          />
          <StatCard
            title="Active Threats"
            value="23"
            trend="+12%"
            isPositive={false}
            color="error"
          />
          <StatCard
            title="Compliance Status"
            value="92%"
            trend="+3%"
            isPositive={true}
            color="success"
          />
          <StatCard
            title="Incidents (30d)"
            value="47"
            trend="-8%"
            isPositive={true}
            color="warning"
          />
        </div>

        {/* Risk & Trends Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RiskGauge
            score={67}
            label="Overall Security Risk"
          />
          <TrendAnalysis
            metric="Security Incidents"
            range="30d"
          />
        </div>

        {/* Geographic & Compliance Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ThreatHeatmap />
          <ComplianceRadar framework="ALL" />
        </div>

        {/* Financial Impact Section */}
        <div className="bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[var(--colors-textPrimary)] mb-4">
            Financial Impact Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-[var(--colors-surfaceRaised)] rounded-lg">
              <p className="text-xs text-[var(--colors-textSecondary)] mb-2">
                Potential Risk Exposure
              </p>
              <p className="text-2xl font-bold font-mono text-[var(--colors-textPrimary)]">
                $2.4M
              </p>
              <p className="text-xs text-[var(--colors-error)] mt-1">
                High Priority
              </p>
            </div>
            <div className="text-center p-4 bg-[var(--colors-surfaceRaised)] rounded-lg">
              <p className="text-xs text-[var(--colors-textSecondary)] mb-2">
                Security Investment
              </p>
              <p className="text-2xl font-bold font-mono text-[var(--colors-textPrimary)]">
                $850K
              </p>
              <p className="text-xs text-[var(--colors-success)] mt-1">
                Within Budget
              </p>
            </div>
            <div className="text-center p-4 bg-[var(--colors-surfaceRaised)] rounded-lg">
              <p className="text-xs text-[var(--colors-textSecondary)] mb-2">
                Avoided Losses (YTD)
              </p>
              <p className="text-2xl font-bold font-mono text-[var(--colors-textPrimary)]">
                $1.7M
              </p>
              <p className="text-xs text-[var(--colors-success)] mt-1">
                ROI: 200%
              </p>
            </div>
          </div>
        </div>

        {/* Strategic Recommendations */}
        <div className="bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[var(--colors-textPrimary)] mb-4">
            Strategic Recommendations
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-[var(--colors-surfaceRaised)] rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--colors-error)] bg-opacity-20 flex items-center justify-center text-[var(--colors-error)]">
                1
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-[var(--colors-textPrimary)] mb-1">
                  Critical: Enhance Email Security
                </h4>
                <p className="text-xs text-[var(--colors-textSecondary)]">
                  45% of incidents originate from phishing attacks. Implement advanced email filtering and user training.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-[var(--colors-surfaceRaised)] rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--colors-warning)] bg-opacity-20 flex items-center justify-center text-[var(--colors-warning)]">
                2
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-[var(--colors-textPrimary)] mb-1">
                  High: Improve Patch Management
                </h4>
                <p className="text-xs text-[var(--colors-textSecondary)]">
                  23% of vulnerabilities remain unpatched beyond SLA. Automate patching process.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-[var(--colors-surfaceRaised)] rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--colors-primary)] bg-opacity-20 flex items-center justify-center text-[var(--colors-primary)]">
                3
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-[var(--colors-textPrimary)] mb-1">
                  Medium: Strengthen Access Controls
                </h4>
                <p className="text-xs text-[var(--colors-textSecondary)]">
                  Implement zero-trust architecture and multi-factor authentication across all critical systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
