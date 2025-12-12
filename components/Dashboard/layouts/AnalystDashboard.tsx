
import React from 'react';
import ThreatMatrix from '../ThreatMatrix';
import NetworkGraph from '../NetworkGraph';
import TimelineChart from '../TimelineChart';
import ActorProfile from '../ActorProfile';
import IncidentTimeline from '../IncidentTimeline';
import TrendAnalysis from '../TrendAnalysis';

interface AnalystDashboardProps {
  className?: string;
}

/**
 * Analyst Dashboard Layout
 * Detailed threat analysis and investigation tools for security analysts
 */
const AnalystDashboard: React.FC<AnalystDashboardProps> = ({ className = '' }) => {
  return (
    <div className={`w-full h-full overflow-y-auto ${className}`}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--colors-textPrimary)] mb-2">
            Analyst Dashboard
          </h1>
          <p className="text-sm text-[var(--colors-textSecondary)]">
            Deep-dive threat analysis and investigation workspace
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)] rounded-lg p-4">
            <p className="text-xs text-[var(--colors-textSecondary)] mb-1">
              Open Investigations
            </p>
            <p className="text-2xl font-bold text-[var(--colors-textPrimary)]">
              12
            </p>
            <p className="text-xs text-[var(--colors-warning)] mt-1">
              3 High Priority
            </p>
          </div>
          <div className="bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)] rounded-lg p-4">
            <p className="text-xs text-[var(--colors-textSecondary)] mb-1">
              IOCs Identified (24h)
            </p>
            <p className="text-2xl font-bold text-[var(--colors-textPrimary)]">
              234
            </p>
            <p className="text-xs text-[var(--colors-error)] mt-1">
              +45 from yesterday
            </p>
          </div>
          <div className="bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)] rounded-lg p-4">
            <p className="text-xs text-[var(--colors-textSecondary)] mb-1">
              Threat Actors Tracked
            </p>
            <p className="text-2xl font-bold text-[var(--colors-textPrimary)]">
              18
            </p>
            <p className="text-xs text-[var(--colors-primary)] mt-1">
              5 Active Campaigns
            </p>
          </div>
          <div className="bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)] rounded-lg p-4">
            <p className="text-xs text-[var(--colors-textSecondary)] mb-1">
              MITRE Techniques
            </p>
            <p className="text-2xl font-bold text-[var(--colors-textPrimary)]">
              87
            </p>
            <p className="text-xs text-[var(--colors-textSecondary)] mt-1">
              Observed this month
            </p>
          </div>
        </div>

        {/* MITRE ATT&CK Matrix */}
        <ThreatMatrix />

        {/* Network Relationships & Temporal Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NetworkGraph />
          <TimelineChart range="7d" />
        </div>

        {/* Trend Analysis */}
        <TrendAnalysis metric="Threat Activity" range="30d" />

        {/* Actor Profile & Incident Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActorProfile />
          <IncidentTimeline />
        </div>

        {/* Investigation Tools */}
        <div className="bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[var(--colors-textPrimary)] mb-4">
            Quick Investigation Tools
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-[var(--colors-surfaceRaised)] hover:bg-[var(--colors-surfaceHighlight)] rounded-lg border border-[var(--colors-borderDefault)] transition-colors text-left">
              <div className="text-2xl mb-2">🔍</div>
              <h4 className="text-sm font-bold text-[var(--colors-textPrimary)] mb-1">
                IOC Lookup
              </h4>
              <p className="text-xs text-[var(--colors-textSecondary)]">
                Search for indicators across all data sources
              </p>
            </button>
            <button className="p-4 bg-[var(--colors-surfaceRaised)] hover:bg-[var(--colors-surfaceHighlight)] rounded-lg border border-[var(--colors-borderDefault)] transition-colors text-left">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="text-sm font-bold text-[var(--colors-textPrimary)] mb-1">
                Threat Intelligence
              </h4>
              <p className="text-xs text-[var(--colors-textSecondary)]">
                Access external threat feeds and reports
              </p>
            </button>
            <button className="p-4 bg-[var(--colors-surfaceRaised)] hover:bg-[var(--colors-surfaceHighlight)] rounded-lg border border-[var(--colors-borderDefault)] transition-colors text-left">
              <div className="text-2xl mb-2">🧩</div>
              <h4 className="text-sm font-bold text-[var(--colors-textPrimary)] mb-1">
                Pattern Analysis
              </h4>
              <p className="text-xs text-[var(--colors-textSecondary)]">
                Detect patterns and anomalies in data
              </p>
            </button>
          </div>
        </div>

        {/* Recent Findings */}
        <div className="bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[var(--colors-textPrimary)] mb-4">
            Recent Analyst Findings
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-[var(--colors-surfaceRaised)] rounded-lg border border-[var(--colors-borderDefault)]">
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--colors-error)] mt-2"></div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-sm font-bold text-[var(--colors-textPrimary)]">
                    APT29 Campaign Detected
                  </h4>
                  <span className="text-xs text-[var(--colors-textSecondary)]">2h ago</span>
                </div>
                <p className="text-xs text-[var(--colors-textSecondary)] mb-2">
                  Sophisticated phishing campaign targeting finance department. 47 indicators correlated across multiple data sources.
                </p>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-[var(--colors-error)] bg-opacity-20 text-[var(--colors-error)]">
                    CRITICAL
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded border border-[var(--colors-borderDefault)] text-[var(--colors-textSecondary)]">
                    T1566.001
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded border border-[var(--colors-borderDefault)] text-[var(--colors-textSecondary)]">
                    Assigned: J. Smith
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-[var(--colors-surfaceRaised)] rounded-lg border border-[var(--colors-borderDefault)]">
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--colors-warning)] mt-2"></div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-sm font-bold text-[var(--colors-textPrimary)]">
                    Lateral Movement Pattern Identified
                  </h4>
                  <span className="text-xs text-[var(--colors-textSecondary)]">5h ago</span>
                </div>
                <p className="text-xs text-[var(--colors-textSecondary)] mb-2">
                  Unusual SMB traffic detected between servers in different security zones. Potential compromised credentials.
                </p>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-[var(--colors-warning)] bg-opacity-20 text-[var(--colors-warning)]">
                    HIGH
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded border border-[var(--colors-borderDefault)] text-[var(--colors-textSecondary)]">
                    T1021.002
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded border border-[var(--colors-borderDefault)] text-[var(--colors-textSecondary)]">
                    Assigned: M. Chen
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalystDashboard;
