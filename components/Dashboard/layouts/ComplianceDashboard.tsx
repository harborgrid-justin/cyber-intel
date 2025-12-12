
import React from 'react';
import ComplianceRadar from '../ComplianceRadar';
import StatCard from '../StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardHeader } from '../../Shared/UI';
import { TOKENS } from '../../../styles/theme';

interface ComplianceDashboardProps {
  className?: string;
}

/**
 * Compliance Dashboard Layout
 * GRC (Governance, Risk & Compliance) monitoring and reporting
 */
const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({ className = '' }) => {
  const CHARTS = TOKENS.dark.charts;
  const GRAPH = TOKENS.dark.graph;

  // Mock compliance framework data
  const frameworkData = [
    { name: 'NIST CSF', score: 88, target: 90, status: 'good' },
    { name: 'ISO 27001', score: 92, target: 95, status: 'excellent' },
    { name: 'SOC 2', score: 85, target: 90, status: 'good' },
    { name: 'GDPR', score: 78, target: 85, status: 'fair' },
    { name: 'HIPAA', score: 95, target: 95, status: 'excellent' },
    { name: 'PCI DSS', score: 82, target: 90, status: 'good' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return CHARTS.primary;
      case 'good': return '#10b981';
      case 'fair': return GRAPH.threatMedium;
      default: return GRAPH.threatHigh;
    }
  };

  return (
    <div className={`w-full h-full overflow-y-auto ${className}`}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--colors-textPrimary)] mb-2">
            Compliance Dashboard
          </h1>
          <p className="text-sm text-[var(--colors-textSecondary)]">
            Governance, Risk & Compliance monitoring
          </p>
        </div>

        {/* Compliance Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Overall Compliance"
            value="87%"
            trend="+3%"
            isPositive={true}
            color="success"
          />
          <StatCard
            title="Open Findings"
            value="23"
            trend="-12%"
            isPositive={true}
            color="warning"
          />
          <StatCard
            title="Audit Ready"
            value="92%"
            trend="+5%"
            isPositive={true}
            color="primary"
          />
          <StatCard
            title="Policy Violations"
            value="7"
            trend="-30%"
            isPositive={true}
            color="error"
          />
        </div>

        {/* Compliance Radar & Framework Scores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComplianceRadar framework="ALL" />

          <Card className="shadow-lg p-0 overflow-hidden flex flex-col">
            <CardHeader title="Framework Compliance Scores" />
            <div className="flex-1 w-full min-h-0 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frameworkData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={CHARTS.grid} />
                  <XAxis type="number" domain={[0, 100]} stroke={CHARTS.text} fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke={CHARTS.text} fontSize={11} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: CHARTS.tooltipBg,
                      borderColor: CHARTS.tooltipBorder,
                      color: CHARTS.tooltipText
                    }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {frameworkData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Control Categories */}
        <div className="bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[var(--colors-textPrimary)] mb-4">
            Control Categories Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-[var(--colors-surfaceRaised)] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-[var(--colors-textPrimary)]">
                  Access Control
                </h4>
                <span className="text-xs px-2 py-1 rounded bg-[var(--colors-success)] bg-opacity-20 text-[var(--colors-success)]">
                  95%
                </span>
              </div>
              <div className="w-full h-2 bg-[var(--colors-surfaceDefault)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--colors-success)]" style={{ width: '95%' }}></div>
              </div>
              <p className="text-xs text-[var(--colors-textSecondary)] mt-2">
                47 / 50 controls implemented
              </p>
            </div>

            <div className="p-4 bg-[var(--colors-surfaceRaised)] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-[var(--colors-textPrimary)]">
                  Data Protection
                </h4>
                <span className="text-xs px-2 py-1 rounded bg-[var(--colors-success)] bg-opacity-20 text-[var(--colors-success)]">
                  88%
                </span>
              </div>
              <div className="w-full h-2 bg-[var(--colors-surfaceDefault)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--colors-success)]" style={{ width: '88%' }}></div>
              </div>
              <p className="text-xs text-[var(--colors-textSecondary)] mt-2">
                35 / 40 controls implemented
              </p>
            </div>

            <div className="p-4 bg-[var(--colors-surfaceRaised)] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-[var(--colors-textPrimary)]">
                  Incident Response
                </h4>
                <span className="text-xs px-2 py-1 rounded bg-[var(--colors-primary)] bg-opacity-20 text-[var(--colors-primary)]">
                  92%
                </span>
              </div>
              <div className="w-full h-2 bg-[var(--colors-surfaceDefault)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--colors-primary)]" style={{ width: '92%' }}></div>
              </div>
              <p className="text-xs text-[var(--colors-textSecondary)] mt-2">
                23 / 25 controls implemented
              </p>
            </div>

            <div className="p-4 bg-[var(--colors-surfaceRaised)] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-[var(--colors-textPrimary)]">
                  Risk Management
                </h4>
                <span className="text-xs px-2 py-1 rounded bg-[var(--colors-warning)] bg-opacity-20 text-[var(--colors-warning)]">
                  75%
                </span>
              </div>
              <div className="w-full h-2 bg-[var(--colors-surfaceDefault)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--colors-warning)]" style={{ width: '75%' }}></div>
              </div>
              <p className="text-xs text-[var(--colors-textSecondary)] mt-2">
                30 / 40 controls implemented
              </p>
            </div>

            <div className="p-4 bg-[var(--colors-surfaceRaised)] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-[var(--colors-textPrimary)]">
                  Security Monitoring
                </h4>
                <span className="text-xs px-2 py-1 rounded bg-[var(--colors-primary)] bg-opacity-20 text-[var(--colors-primary)]">
                  90%
                </span>
              </div>
              <div className="w-full h-2 bg-[var(--colors-surfaceDefault)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--colors-primary)]" style={{ width: '90%' }}></div>
              </div>
              <p className="text-xs text-[var(--colors-textSecondary)] mt-2">
                27 / 30 controls implemented
              </p>
            </div>

            <div className="p-4 bg-[var(--colors-surfaceRaised)] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-[var(--colors-textPrimary)]">
                  Vulnerability Mgmt
                </h4>
                <span className="text-xs px-2 py-1 rounded bg-[var(--colors-success)] bg-opacity-20 text-[var(--colors-success)]">
                  85%
                </span>
              </div>
              <div className="w-full h-2 bg-[var(--colors-surfaceDefault)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--colors-success)]" style={{ width: '85%' }}></div>
              </div>
              <p className="text-xs text-[var(--colors-textSecondary)] mt-2">
                34 / 40 controls implemented
              </p>
            </div>
          </div>
        </div>

        {/* Audit Trail & Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)] rounded-lg p-6">
            <h3 className="text-lg font-bold text-[var(--colors-textPrimary)] mb-4">
              Upcoming Audits
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-[var(--colors-surfaceRaised)] rounded-lg border-l-4 border-[var(--colors-error)]">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-sm font-bold text-[var(--colors-textPrimary)]">
                    SOC 2 Type II Audit
                  </h4>
                  <span className="text-xs text-[var(--colors-error)]">7 days</span>
                </div>
                <p className="text-xs text-[var(--colors-textSecondary)]">
                  External auditor review scheduled. 3 critical findings to remediate.
                </p>
              </div>
              <div className="p-3 bg-[var(--colors-surfaceRaised)] rounded-lg border-l-4 border-[var(--colors-warning)]">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-sm font-bold text-[var(--colors-textPrimary)]">
                    ISO 27001 Surveillance
                  </h4>
                  <span className="text-xs text-[var(--colors-warning)]">21 days</span>
                </div>
                <p className="text-xs text-[var(--colors-textSecondary)]">
                  Annual surveillance audit. Documentation review in progress.
                </p>
              </div>
              <div className="p-3 bg-[var(--colors-surfaceRaised)] rounded-lg border-l-4 border-[var(--colors-primary)]">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-sm font-bold text-[var(--colors-textPrimary)]">
                    Internal Security Review
                  </h4>
                  <span className="text-xs text-[var(--colors-primary)]">45 days</span>
                </div>
                <p className="text-xs text-[var(--colors-textSecondary)]">
                  Quarterly internal audit of security controls and processes.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)] rounded-lg p-6">
            <h3 className="text-lg font-bold text-[var(--colors-textPrimary)] mb-4">
              Recent Compliance Activities
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--colors-success)] mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-[var(--colors-textPrimary)] mb-1">
                    <span className="font-bold">Security policy updated</span>
                  </p>
                  <p className="text-xs text-[var(--colors-textSecondary)]">
                    Data classification policy v2.1 approved and published
                  </p>
                  <span className="text-xs text-[var(--colors-textSecondary)]">2h ago</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--colors-primary)] mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-[var(--colors-textPrimary)] mb-1">
                    <span className="font-bold">Control evidence collected</span>
                  </p>
                  <p className="text-xs text-[var(--colors-textSecondary)]">
                    AC-2: Account Management - 15 new evidence items added
                  </p>
                  <span className="text-xs text-[var(--colors-textSecondary)]">5h ago</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--colors-warning)] mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-[var(--colors-textPrimary)] mb-1">
                    <span className="font-bold">Finding remediated</span>
                  </p>
                  <p className="text-xs text-[var(--colors-textSecondary)]">
                    MFA enforcement gap closed for admin accounts
                  </p>
                  <span className="text-xs text-[var(--colors-textSecondary)]">1d ago</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--colors-success)] mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-[var(--colors-textPrimary)] mb-1">
                    <span className="font-bold">Training completed</span>
                  </p>
                  <p className="text-xs text-[var(--colors-textSecondary)]">
                    92% of staff completed annual security awareness training
                  </p>
                  <span className="text-xs text-[var(--colors-textSecondary)]">2d ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Policy & Documentation Status */}
        <div className="bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[var(--colors-textPrimary)] mb-4">
            Policy & Documentation Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[var(--colors-surfaceRaised)] rounded-lg">
              <p className="text-xs text-[var(--colors-textSecondary)] mb-2">
                Active Policies
              </p>
              <p className="text-3xl font-bold text-[var(--colors-textPrimary)]">
                42
              </p>
              <p className="text-xs text-[var(--colors-success)] mt-1">
                All current
              </p>
            </div>
            <div className="text-center p-4 bg-[var(--colors-surfaceRaised)] rounded-lg">
              <p className="text-xs text-[var(--colors-textSecondary)] mb-2">
                Procedures
              </p>
              <p className="text-3xl font-bold text-[var(--colors-textPrimary)]">
                87
              </p>
              <p className="text-xs text-[var(--colors-warning)] mt-1">
                5 need review
              </p>
            </div>
            <div className="text-center p-4 bg-[var(--colors-surfaceRaised)] rounded-lg">
              <p className="text-xs text-[var(--colors-textSecondary)] mb-2">
                Evidence Items
              </p>
              <p className="text-3xl font-bold text-[var(--colors-textPrimary)]">
                1,247
              </p>
              <p className="text-xs text-[var(--colors-success)] mt-1">
                +156 this month
              </p>
            </div>
            <div className="text-center p-4 bg-[var(--colors-surfaceRaised)] rounded-lg">
              <p className="text-xs text-[var(--colors-textSecondary)] mb-2">
                Staff Training
              </p>
              <p className="text-3xl font-bold text-[var(--colors-textPrimary)]">
                92%
              </p>
              <p className="text-xs text-[var(--colors-success)] mt-1">
                Target: 90%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;
