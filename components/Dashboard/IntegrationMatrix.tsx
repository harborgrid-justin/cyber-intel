
import React, { useMemo } from 'react';
import { Card, SectionHeader, StatusIndicator } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';
import { InterconnectLogic } from '../../services/logic/InterconnectLogic';
import { Icons } from '../Shared/Icons';
import { IntegrationMetric } from '../../types';
import { TOKENS } from '../../styles/theme';

// Reusable Matrix Cell Component
const MatrixCell: React.FC<{ metric: IntegrationMetric }> = ({ metric }) => {
    const IconComponent = (Icons as any)[metric.icon] || Icons.Activity;
    
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'CRITICAL': return `bg-[var(--colors-errorDim)] border-[var(--colors-error)] text-[var(--colors-error)]`;
            case 'WARNING': return `bg-[var(--colors-warningDim)] border-[var(--colors-warning)] text-[var(--colors-warning)]`;
            case 'ACTIVE': return `bg-[var(--colors-infoDim)] border-[var(--colors-info)] text-[var(--colors-info)]`;
            case 'MITIGATING': return `bg-[var(--colors-infoDim)] border-[var(--colors-info)] text-[var(--colors-info)]`;
            case 'SECURE': return `bg-[var(--colors-successDim)] border-[var(--colors-success)] text-[var(--colors-success)]`;
            case 'MONITORING': return `bg-purple-900/20 border-purple-500 text-purple-400 border`;
            case 'IDLE': 
            default: 
                return `bg-slate-900/20 border border-dashed border-slate-800/50 text-slate-500 hover:border-slate-600 hover:bg-slate-800/30 hover:text-slate-300`;
        }
    };

    const baseClass = getStatusStyle(metric.status);

    return (
        <div className={`p-2 rounded flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 min-h-[80px] ${baseClass}`}>
            <IconComponent className="w-4 h-4 mb-1" />
            <div className="text-[9px] font-bold text-center leading-tight opacity-90">{metric.name}</div>
            <div className="text-xs font-mono font-bold">{metric.value}</div>
            <StatusIndicator 
                color={metric.status === 'CRITICAL' ? 'red' : metric.status === 'WARNING' ? 'orange' : metric.status === 'ACTIVE' ? 'cyan' : 'slate'} 
                pulse={metric.status === 'CRITICAL' || metric.status === 'WARNING' || metric.status === 'ACTIVE'}
                className="w-1.5 h-1.5 mt-1"
            />
        </div>
    );
};

export const IntegrationMatrix: React.FC = () => {
  const threats = useDataStore(() => threatData.getThreats());
  const assets = useDataStore(() => threatData.getSystemNodes());
  const vulns = useDataStore(() => threatData.getVulnerabilities());
  const users = useDataStore(() => threatData.getSystemUsers());
  const breaches = useDataStore(() => threatData.getOsintBreaches());
  const vendors = useDataStore(() => threatData.getVendors());
  const playbooks = useDataStore(() => threatData.getPlaybooks());
  const campaigns = useDataStore(() => threatData.getCampaigns());
  const darkWeb = useDataStore(() => threatData.getOsintDarkWeb());

  const metrics: IntegrationMetric[] = useMemo(() => {
    // 1-5
    const compromisedAssets = threatData.getCompromisedAssets();
    const escalatableVulns = threatData.getEscalatableVulns();
    const attributionCount = campaigns.filter(c => c.actors.length > 0).length;
    const vendorRisk = vendors.filter(v => InterconnectLogic.detectShadowRisk(v, vulns) > 0).length;
    const compatiblePlaybooks = playbooks.filter(p => assets.some(a => InterconnectLogic.checkPlaybookCompatibility(p, a))).length;

    // 6-10
    const compromisedUsers = users.filter(u => InterconnectLogic.checkUserCompromise(u, breaches));
    const insiderThreats = 1; // Static for demo
    const firewallUpdates = threats.filter(t => InterconnectLogic.generateBlockRule(t)).length;

    // 11-15
    const simTunedAssets = 3; // Static
    const autoReports = 12; // Static
    const sanctionedVendors = vendors.filter(v => InterconnectLogic.checkVendorSanctions(v, 'Russia')).length;
    const scanTargets = InterconnectLogic.getScanTargets(threats).length;
    const jitAccess = 2; // Static

    // 16-20
    const graphContexts = 45; 
    const botnetActive = InterconnectLogic.detectBotnetSurge(threats, 500);
    const vipRisk = 1; 
    const sandboxJobs = threats.filter(t => InterconnectLogic.requiresSandboxing(t)).length;
    const compliantLogs = 99; // %

    // 21-26
    const mitreCoverage = 25; // %
    const financialExposure = campaigns.reduce((acc, c) => acc + InterconnectLogic.estimateCampaignLoss(c), 0);
    const vendorLeaks = vendors.filter(v => InterconnectLogic.detectVendorLeakage(v, darkWeb)).length;
    const trackedDevices = 5; 
    const segmentationViolations = 0; 
    const sigmaRules = 14; 

    return [
      { id: 1, name: 'Threat -> Asset', status: compromisedAssets.length > 0 ? 'CRITICAL' : 'IDLE', value: `${compromisedAssets.length}`, icon: 'Server' },
      { id: 2, name: 'Vuln -> Case', status: escalatableVulns.length > 0 ? 'ACTIVE' : 'IDLE', value: `${escalatableVulns.length}`, icon: 'AlertTriangle' },
      { id: 3, name: 'Actor -> Campaign', status: 'ACTIVE', value: `${attributionCount}`, icon: 'Users' },
      { id: 4, name: 'Vendor -> Vuln', status: vendorRisk > 0 ? 'WARNING' : 'SECURE', value: `${vendorRisk}`, icon: 'Box' },
      { id: 5, name: 'Playbook -> Asset', status: 'ACTIVE', value: `${compatiblePlaybooks}`, icon: 'Zap' },
      { id: 6, name: 'User -> Breach', status: compromisedUsers.length > 0 ? 'WARNING' : 'SECURE', value: `${compromisedUsers.length}`, icon: 'UserX' },
      { id: 7, name: 'Chat -> Response', status: 'ACTIVE', value: 'ON', icon: 'Activity' },
      { id: 8, name: 'Evidence -> Case', status: 'SECURE', value: '100%', icon: 'FileText' },
      { id: 9, name: 'Audit -> Actor', status: 'WARNING', value: `${insiderThreats}`, icon: 'Eye' },
      { id: 10, name: 'Feed -> Firewall', status: 'ACTIVE', value: `${firewallUpdates}`, icon: 'Shield' },
      { id: 11, name: 'Sim -> Asset', status: 'ACTIVE', value: `${simTunedAssets}`, icon: 'Target' },
      { id: 12, name: 'Report -> Case', status: 'IDLE', value: `${autoReports}`, icon: 'FileText' },
      { id: 13, name: 'Geo -> Vendor', status: sanctionedVendors > 0 ? 'CRITICAL' : 'SECURE', value: `${sanctionedVendors}`, icon: 'Globe' },
      { id: 14, name: 'Feed -> Scanner', status: 'ACTIVE', value: `${scanTargets}`, icon: 'Search' },
      { id: 15, name: 'Case -> User', status: 'ACTIVE', value: `${jitAccess}`, icon: 'Key' },
      { id: 16, name: 'Graph -> AI', status: 'ACTIVE', value: `${graphContexts}`, icon: 'Share2' },
      { id: 17, name: 'NetOps -> Threat', status: botnetActive ? 'MITIGATING' : 'MONITORING', value: botnetActive ? 'High' : 'Normal', icon: 'Wifi' },
      { id: 18, name: 'VIP -> Social', status: 'ACTIVE', value: `${vipRisk}`, icon: 'Star' },
      { id: 19, name: 'Malware -> Lab', status: 'ACTIVE', value: `${sandboxJobs}`, icon: 'Box' },
      { id: 20, name: 'Retain -> Comply', status: 'SECURE', value: `${compliantLogs}%`, icon: 'Database' },
      { id: 21, name: 'MITRE -> Playbook', status: 'IDLE', value: `${mitreCoverage}%`, icon: 'Grid' },
      { id: 22, name: 'Campaign -> Fin', status: 'WARNING', value: `$${(financialExposure/1000).toFixed(0)}k`, icon: 'DollarSign' },
      { id: 23, name: 'DarkWeb -> Vendor', status: vendorLeaks > 0 ? 'CRITICAL' : 'SECURE', value: `${vendorLeaks}`, icon: 'EyeOff' },
      { id: 24, name: 'IoT -> Geo', status: 'ACTIVE', value: `${trackedDevices}`, icon: 'MapPin' },
      { id: 25, name: 'Policy -> Net', status: 'SECURE', value: `${segmentationViolations}`, icon: 'Lock' },
      { id: 26, name: 'PCAP -> Detect', status: 'ACTIVE', value: `${sigmaRules}`, icon: 'Code' },
    ];
  }, [threats, assets, vulns, users, breaches, vendors, playbooks, campaigns, darkWeb]);

  return (
    <Card className="p-0 overflow-hidden mt-6">
      <SectionHeader title="System Integration Synapse" subtitle="Cross-Module Data Fusion Status" />
      <div className="p-4 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {metrics.map(m => (
          <MatrixCell key={m.id} metric={m} />
        ))}
      </div>
    </Card>
  );
};