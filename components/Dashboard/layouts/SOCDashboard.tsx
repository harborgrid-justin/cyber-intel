
import React from 'react';
import StatCard from '../StatCard';
import TimelineChart from '../TimelineChart';
import IncidentTimeline from '../IncidentTimeline';
import ThreatHeatmap from '../ThreatHeatmap';
import CampaignFlow from '../CampaignFlow';
import RiskGauge from '../RiskGauge';

interface SOCDashboardProps {
  className?: string;
}

/**
 * SOC Dashboard Layout
 * Real-time security operations and incident response view
 */
const SOCDashboard: React.FC<SOCDashboardProps> = ({ className = '' }) => {
  return (
    <div className={`w-full h-full overflow-y-auto ${className}`}>
      <div className="p-6 space-y-6">
        {/* Header with Live Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--colors-textPrimary)] mb-2">
                Security Operations Center
              </h1>
              <p className="text-sm text-[var(--colors-textSecondary)]">
                Real-time monitoring and incident response
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-[var(--colors-success)] bg-opacity-20 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-[var(--colors-success)] animate-pulse"></div>
                <span className="text-sm font-bold text-[var(--colors-success)]">
                  SOC OPERATIONAL
                </span>
              </div>
              <div className="px-4 py-2 bg-[var(--colors-surfaceRaised)] rounded-lg">
                <span className="text-sm font-mono text-[var(--colors-textPrimary)]">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Alerts Banner */}
        <div className="bg-gradient-to-r from-[var(--colors-error)] to-[var(--colors-warning)] p-1 rounded-lg">
          <div className="bg-[var(--colors-surfaceDefault)] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🚨</div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--colors-textPrimary)] mb-1">
                    3 Critical Alerts Require Immediate Attention
                  </h3>
                  <p className="text-xs text-[var(--colors-textSecondary)]">
                    DDoS attack detected, Ransomware attempt blocked, Privilege escalation in progress
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 bg-[var(--colors-error)] text-white rounded-lg font-bold text-sm hover:bg-[var(--colors-error)] hover:opacity-90 transition-opacity">
                VIEW ALERTS
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Incidents"
            value="8"
            trend="+2"
            isPositive={false}
            color="error"
          />
          <StatCard
            title="Alerts (Last Hour)"
            value="156"
            trend="+23%"
            isPositive={false}
            color="warning"
          />
          <StatCard
            title="Events/Second"
            value="2.4K"
            trend="+5%"
            isPositive={true}
            color="primary"
          />
          <StatCard
            title="Mean Time to Detect"
            value="4.2m"
            trend="-15%"
            isPositive={true}
            color="success"
          />
        </div>

        {/* Threat Activity & Risk */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TimelineChart range="24h" />
          </div>
          <RiskGauge score={72} label="Current Threat Level" />
        </div>

        {/* Active Incidents & Campaign Tracking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IncidentTimeline />
          <CampaignFlow />
        </div>

        {/* Geographic Threat Distribution */}
        <ThreatHeatmap />

        {/* SOC Team Status */}
        <div className="bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[var(--colors-textPrimary)] mb-4">
            SOC Team Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[var(--colors-surfaceRaised)] rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-[var(--colors-textPrimary)]">
                  Shift Alpha
                </h4>
                <span className="text-xs px-2 py-1 rounded-full bg-[var(--colors-success)] bg-opacity-20 text-[var(--colors-success)]">
                  ON DUTY
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--colors-textSecondary)]">Analysts:</span>
                  <span className="font-bold text-[var(--colors-textPrimary)]">5 / 5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--colors-textSecondary)]">Assigned Cases:</span>
                  <span className="font-bold text-[var(--colors-textPrimary)]">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--colors-textSecondary)]">Shift Ends:</span>
                  <span className="font-bold text-[var(--colors-textPrimary)]">4h 23m</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-[var(--colors-surfaceRaised)] rounded-lg opacity-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-[var(--colors-textPrimary)]">
                  Shift Bravo
                </h4>
                <span className="text-xs px-2 py-1 rounded-full bg-[var(--colors-textSecondary)] bg-opacity-20 text-[var(--colors-textSecondary)]">
                  OFF DUTY
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--colors-textSecondary)]">Analysts:</span>
                  <span className="font-bold text-[var(--colors-textPrimary)]">0 / 5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--colors-textSecondary)]">Next Shift:</span>
                  <span className="font-bold text-[var(--colors-textPrimary)]">4h 23m</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-[var(--colors-surfaceRaised)] rounded-lg opacity-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-[var(--colors-textPrimary)]">
                  Shift Charlie
                </h4>
                <span className="text-xs px-2 py-1 rounded-full bg-[var(--colors-textSecondary)] bg-opacity-20 text-[var(--colors-textSecondary)]">
                  OFF DUTY
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--colors-textSecondary)]">Analysts:</span>
                  <span className="font-bold text-[var(--colors-textPrimary)]">0 / 5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--colors-textSecondary)]">Next Shift:</span>
                  <span className="font-bold text-[var(--colors-textPrimary)]">12h 23m</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Response Playbooks */}
        <div className="bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[var(--colors-textPrimary)] mb-4">
            Quick Response Playbooks
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <button className="p-3 bg-[var(--colors-error)] bg-opacity-10 hover:bg-opacity-20 rounded-lg border border-[var(--colors-error)] transition-colors text-left">
              <div className="text-xl mb-1">🔒</div>
              <h4 className="text-xs font-bold text-[var(--colors-textPrimary)] mb-1">
                Ransomware Response
              </h4>
              <p className="text-xs text-[var(--colors-textSecondary)]">
                Isolate & Contain
              </p>
            </button>
            <button className="p-3 bg-[var(--colors-warning)] bg-opacity-10 hover:bg-opacity-20 rounded-lg border border-[var(--colors-warning)] transition-colors text-left">
              <div className="text-xl mb-1">📧</div>
              <h4 className="text-xs font-bold text-[var(--colors-textPrimary)] mb-1">
                Phishing Incident
              </h4>
              <p className="text-xs text-[var(--colors-textSecondary)]">
                Block & Investigate
              </p>
            </button>
            <button className="p-3 bg-[var(--colors-primary)] bg-opacity-10 hover:bg-opacity-20 rounded-lg border border-[var(--colors-primary)] transition-colors text-left">
              <div className="text-xl mb-1">💣</div>
              <h4 className="text-xs font-bold text-[var(--colors-textPrimary)] mb-1">
                DDoS Mitigation
              </h4>
              <p className="text-xs text-[var(--colors-textSecondary)]">
                Traffic Filtering
              </p>
            </button>
            <button className="p-3 bg-[var(--colors-success)] bg-opacity-10 hover:bg-opacity-20 rounded-lg border border-[var(--colors-success)] transition-colors text-left">
              <div className="text-xl mb-1">🕵️</div>
              <h4 className="text-xs font-bold text-[var(--colors-textPrimary)] mb-1">
                Data Breach
              </h4>
              <p className="text-xs text-[var(--colors-textSecondary)]">
                Forensics & Recovery
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOCDashboard;
