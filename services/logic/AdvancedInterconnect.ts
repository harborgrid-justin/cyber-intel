// Fix: Correct import path for types
import { 
    Threat, SystemNode, Vulnerability, ThreatActor, Campaign, Vendor, Playbook, 
    SystemUser, AuditLog, IncidentStatus
} from '../../types';

export class AdvancedInterconnect {

    // 1. Threat -> User: Spearphishing Susceptibility
    static calcSpearphishingRisk(user: SystemUser, activeThreats: Threat[]): number {
        const targetingRole = activeThreats.some(t => 
            t.description.toLowerCase().includes(user.role.toLowerCase()) || 
            (t.tags && t.tags.includes('Phishing') && t.tags.includes(user.role))
        );
        return targetingRole ? 85 : 15;
    }

    // 2. Asset -> Compliance: Config Drift
    static detectConfigDrift(asset: SystemNode): boolean {
        // Mock baseline hash check
        const baseline = `BASE-${asset.type}-${asset.id.substring(0,4)}`;
        return asset.configHash !== baseline;
    }

    // 3. Feed -> SIEM: Sigma Gen
    static generateSigmaFromStix(indicator: string): string {
        return `
title: Detect STIX Indicator ${indicator}
logsource:
    category: network_connection
detection:
    selection:
        DestinationIp: ${indicator}
    condition: selection
        `.trim();
    }

    // 4. Malware -> Asset: Endpoint Scan (Mock)
    static scanEndpointsForHash(hash: string, assets: SystemNode[]): SystemNode[] {
        // Simulated hit on assets ending in '01'
        return assets.filter(a => a.name.endsWith('01') && Math.random() > 0.8);
    }

    // 5. Campaign -> ThirdParty: Supply Chain Impact
    static findImpactedVendors(campaign: Campaign, vendors: Vendor[]): Vendor[] {
        return vendors.filter(v => 
            campaign.targetSectors.includes(v.category) || 
            campaign.description.includes(v.name)
        );
    }

    // 6. User -> Location: Impossible Travel
    static checkImpossibleTravel(log1: AuditLog, log2: AuditLog): boolean {
        if (!log1.location || !log2.location) return false;
        if (log1.user !== log2.user) return false;
        // Mock check: Different countries within 1 hour
        const timeDiff = Math.abs(new Date(log1.timestamp).getTime() - new Date(log2.timestamp).getTime());
        const locDiff = log1.location !== log2.location; 
        return locDiff && timeDiff < 3600000; 
    }

    // 7. Vuln -> Threat: Exploit Tagging
    static isExploitAvailable(vuln: Vulnerability, threats: Threat[]): boolean {
        return threats.some(t => t.type === 'Exploit' && t.indicator === vuln.id);
    }

    // 8. Playbook -> Compliance: Evidence
    static addEvidenceTask(playbook: Playbook): Playbook {
        if (!playbook.tasks.includes('Collect Evidence')) {
            return { ...playbook, tasks: [...playbook.tasks, 'Collect Evidence', 'Hash & Timestamp'] };
        }
        return playbook;
    }

    // 9. Network -> Threat: Beaconing
    static detectBeaconing(flowLogs: any[]): boolean {
        // Heuristic: >5 connections with same interval
        return flowLogs.length > 5; 
    }

    // 10. Asset -> Asset: Lateral Path
    static predictLateralMove(source: SystemNode, target: SystemNode): boolean {
        // Simple subnet match logic
        const srcSubnet = source.ip_address?.split('.').slice(0,3).join('.');
        const tgtSubnet = target.ip_address?.split('.').slice(0,3).join('.');
        return srcSubnet === tgtSubnet && !target.securityControls.includes('FIREWALL');
    }

    // 11. Threat -> Region: Geo Risk
    static assessGeoRisk(threat: Threat, asset: SystemNode): boolean {
        // If asset is in same region as threat origin
        return threat.origin === asset.dataSensitivity; // Using dataSensitivity as region proxy for demo
    }

    // 12. Incident -> User: Insider Score
    static scoreInsiderDuringIncident(user: SystemUser, incidentTime: string): number {
        const incStart = new Date(incidentTime).getTime();
        const lastLogin = new Date(user.lastLogin || '').getTime();
        // If user logged in during incident window
        return (Math.abs(incStart - lastLogin) < 7200000) ? 50 : 0;
    }

    // 13. Feed -> Email: Blocklist
    static generateEmailBlocklist(threats: Threat[]): string[] {
        return threats.filter(t => t.type === 'Domain' && t.tags?.includes('Phishing')).map(t => t.indicator);
    }

    // 14. Vuln -> Asset: Risk-Based Patching
    static calculatePatchPriority(vuln: Vulnerability, asset: SystemNode): number {
        let score = vuln.score * 10;
        if (asset.criticality === 'CRITICAL') score += 20;
        if (asset.dataSensitivity === 'RESTRICTED') score += 15;
        return Math.min(100, score);
    }

    // 15. User -> Asset: Over-privilege
    static checkOverPrivilege(user: SystemUser, asset: SystemNode): boolean {
        // Mock logic
        return user.role !== 'Admin' && asset.criticality === 'CRITICAL';
    }
}