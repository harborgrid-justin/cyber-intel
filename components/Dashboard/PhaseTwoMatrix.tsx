import React, { useMemo } from 'react';
import { Card, SectionHeader, StatusIndicator } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';
import { AdvancedInterconnect } from '../../services/logic/AdvancedInterconnect';
import { DeepAnalytics } from '../../services/logic/DeepAnalytics';
import { Icons } from '../Shared/Icons';
import { IntegrationMetric } from '../../types';
import { TOKENS } from '../../styles/theme';

// Reusable Cell
const MatrixCell: React.FC<{ metric: IntegrationMetric }> = ({ metric }) => {
    const IconComponent = Icons[metric.icon as keyof typeof Icons] || Icons.Activity;
    
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
        <div className={`p-2 rounded flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 min-h-[70px] ${baseClass}`}>
            <IconComponent className="w-4 h-4 mb-1" />
            <div className="text-[9px] font-bold text-center leading-tight opacity-90">{metric.name}</div>
            <div className="text-xs font-mono font-bold">{metric.value}</div>
        </div>
    );
};

export const PhaseTwoMatrix: React.FC = () => {
  const threats = useDataStore(() => threatData.getThreats());
  const assets = useDataStore(() => threatData.getSystemNodes());
  const user = useDataStore(() => threatData.currentUser);
  const campaigns = useDataStore(() => threatData.getCampaigns());
  const devices = useDataStore(() => threatData.getDevices());
  
  const activeUser = user || { role: 'Guest' } as any;
  const sampleAsset = assets[0] || { name: 'None' } as any;
  const sampleCampaign = campaigns[0] || { firstSeen: new Date().toISOString() } as any;

  const metrics: IntegrationMetric[] = useMemo(() => {
    // 1-15: AdvancedInterconnect
    const spearPhishRisk = AdvancedInterconnect.calcSpearphishingRisk(activeUser, threats);
    const drift = AdvancedInterconnect.detectConfigDrift(sampleAsset);
    const siemRules = threats.length;
    const impactedVendors = campaigns.reduce((acc, c) => acc + AdvancedInterconnect.findImpactedVendors(c, threatData.getVendors()).length, 0);
    const emailBlocks = AdvancedInterconnect.generateEmailBlocklist(threats).length;

    // 16-30: DeepAnalytics
    const kcVelocity = DeepAnalytics.calculateKillChainVelocity(sampleCampaign);
    const rogues = devices.filter(d => DeepAnalytics.isRogueDevice(d.macAddress || '', devices)).length;
    const temporal = DeepAnalytics.analyzeTemporalPattern(threats);
    const cloudRisk = DeepAnalytics.analyzeIamRisk(sampleAsset);
    const costEst = DeepAnalytics.estimateIncidentCost(2, 5);
    
    return [
      { id: 1, name: 'Threat -> User', status: spearPhishRisk > 50 ? 'WARNING' : 'SECURE', value: `${spearPhishRisk}%`, icon: 'UserX' },
      { id: 2, name: 'Asset -> Comply', status: drift ? 'CRITICAL' : 'SECURE', value: drift ? 'DRIFT' : 'SYNC', icon: 'Server' },
      { id: 3, name: 'Feed -> SIEM', status: 'ACTIVE', value: `${siemRules}`, icon: 'Code' },
      { id: 4, name: 'Malware -> EP', status: 'ACTIVE', value: 'SCAN', icon: 'Shield' },
      { id: 5, name: 'Camp -> 3rdPty', status: impactedVendors > 0 ? 'WARNING' : 'SECURE', value: `${impactedVendors}`, icon: 'Box' },
      { id: 6, name: 'User -> Loc', status: 'SECURE', value: 'OK', icon: 'Globe' },
      { id: 7, name: 'Vuln -> Threat', status: 'ACTIVE', value: 'XPLT', icon: 'Zap' },
      { id: 8, name: 'Playbook -> Audit', status: 'ACTIVE', value: 'AUTO', icon: 'FileText' },
      { id: 9, name: 'Net -> Threat', status: 'MONITORING', value: 'C2', icon: 'Wifi' },
      { id: 10, name: 'Asset -> Asset', status: 'SECURE', value: 'SEG', icon: 'Network' },
      { id: 11, name: 'Threat -> Region', status: 'WARNING', value: 'GEO', icon: 'Globe' },
      { id: 12, name: 'Inc -> User', status: 'IDLE', value: 'UBA', icon: 'Eye' },
      { id: 13, name: 'Feed -> Email', status: 'ACTIVE', value: `${emailBlocks}`, icon: 'Shield' },
      { id: 14, name: 'Vuln -> Asset', status: 'ACTIVE', value: 'PRIO', icon: 'AlertTriangle' },
      { id: 15, name: 'User -> Asset', status: 'SECURE', value: 'RBAC', icon: 'Key' },
      
      { id: 16, name: 'Camp -> Time', status: kcVelocity.includes('HIGH') ? 'CRITICAL' : 'ACTIVE', value: kcVelocity.split(' ')[0], icon: 'Clock' },
      { id: 17, name: 'Malware -> Net', status: 'ACTIVE', value: 'PROTO', icon: 'Activity' },
      { id: 18, name: 'Asset -> Feed', status: 'IDLE', value: 'HNY', icon: 'Target' },
      { id: 19, name: 'Inc -> MITRE', status: 'ACTIVE', value: 'MAP', icon: 'Grid' },
      { id: 20, name: 'User -> Train', status: 'IDLE', value: 'LMS', icon: 'Users' },
      { id: 21, name: 'Net -> Asset', status: rogues > 0 ? 'CRITICAL' : 'SECURE', value: `${rogues}`, icon: 'Monitor' },
      { id: 22, name: 'Threat -> Hist', status: 'MONITORING', value: 'PTRN', icon: 'Clock' },
      { id: 23, name: 'Asset -> Cloud', status: cloudRisk.includes('CRITICAL') ? 'CRITICAL' : 'SECURE', value: 'IAM', icon: 'Cloud' },
      { id: 24, name: 'Vuln -> Ransom', status: 'WARNING', value: 'RaaS', icon: 'DollarSign' },
      { id: 25, name: 'Inc -> Cost', status: 'ACTIVE', value: `$${(costEst/1000).toFixed(0)}k`, icon: 'DollarSign' },
      { id: 26, name: 'User -> Chat', status: 'SECURE', value: 'NLP', icon: 'MessageSquare' },
      { id: 27, name: 'Feed -> DNS', status: 'ACTIVE', value: 'PDNS', icon: 'Globe' },
      { id: 28, name: 'Asset -> Soft', status: 'ACTIVE', value: '0-DAY', icon: 'Box' },
      { id: 29, name: 'Camp -> Def', status: 'WARNING', value: 'GAP', icon: 'Shield' },
      { id: 30, name: 'Inc -> Legal', status: 'SECURE', value: 'GDPR', icon: 'FileText' },
    ];
  }, [threats, assets, user, campaigns, devices]);

  return (
    <Card className="p-0 overflow-hidden mt-6">
      <SectionHeader title="Deep Analytics & GRC Synapse" subtitle="Phase 2 Intelligence Correlation" />
      <div className="p-4 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3">
        {metrics.map(m => (
          <MatrixCell key={m.id} metric={m} />
        ))}
      </div>
    </Card>
  );
};